using Hangfire;
using Hangfire.Server;
using KnowledgeOS.Backend.Data;
using KnowledgeOS.Backend.Entities.Resources;
using KnowledgeOS.Backend.Entities.Tagging;
using KnowledgeOS.Backend.Jobs.Abstractions;
using KnowledgeOS.Backend.Services;
using KnowledgeOS.Backend.Services.Abstractions;
using KnowledgeOS.Backend.Services.Ai.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace KnowledgeOS.Backend.Jobs;

public class AiAnalysisJob : IAiAnalysisJob
{
    private readonly AppDbContext _context;
    private readonly IAiService _aiService;
    private readonly IEnumerable<IContentFetcher> _contentFetchers;
    private readonly ICategoryService _categoryService;
    private readonly ILogger<AiAnalysisJob> _logger;

    public AiAnalysisJob(
        AppDbContext context,
        IAiService aiService,
        IEnumerable<IContentFetcher> contentFetchers,
        ICategoryService categoryService,
        ILogger<AiAnalysisJob> logger)
    {
        _context = context;
        _aiService = aiService;
        _contentFetchers = contentFetchers;
        _categoryService = categoryService;
        _logger = logger;
    }

    [AutomaticRetry(Attempts = 3, OnAttemptsExceeded = AttemptsExceededAction.Fail)]
    public Task ProcessAsync(Guid resourceId)
    {
        return ProcessInternalAsync(resourceId, null);
    }

    internal Task ProcessInternalAsync(Guid resourceId, PerformContext? context)
    {
        return ProcessInternalCoreAsync(resourceId, context);
    }

    private async Task ProcessInternalCoreAsync(Guid resourceId, PerformContext? context)
    {
        _logger.LogInformation($"Starting AI Analysis for resource: {resourceId}");
        var resource = await _context.Resources
            .IgnoreQueryFilters()
            .Include(r => r.Tags)
            .Include(r => r.InboxMeta)
            .Include(r => r.VaultMeta)
            .FirstOrDefaultAsync(r => r.Id == resourceId);

        if (resource == null)
        {
            _logger.LogError($"Resource not found: {resourceId}");
            return;
        }

        try
        {
            resource.Status = ResourceStatus.AiAnalysing;
            await _context.SaveChangesAsync();

            var preferences = await _context.UserPreferences
                .FirstOrDefaultAsync(p => p.UserId == resource.UserId);

            string? extraContent = null;
            var fetcher = _contentFetchers.FirstOrDefault(f => f.CanHandle(resource));
            if (fetcher != null)
            {
                _logger.LogInformation($"Fetching content using {fetcher.GetType().Name}");
                extraContent = await fetcher.FetchContentAsync(resource);
            }

            string[] tagsToProcess;

            if (resource.IsVaultTarget)
            {
                var existingCategories = await _categoryService.GetUserCategoryNamesAsync(resource.UserId);

                var result =
                    await _aiService.AnalyzeForVaultAsync(resource, preferences, existingCategories, extraContent);

                resource.CorrectedTitle = result.CorrectedTitle;
                tagsToProcess = result.SuggestedTags;

                if (resource.VaultMeta == null)
                {
                    resource.VaultMeta = new VaultMetadata
                    {
                        ResourceId = resource.Id,
                        AiSummary = result.Summary,
                        SuggestedCategoryName = result.SuggestedCategoryName,
                        PromotedToVaultAt = DateTime.UtcNow
                    };
                }
                else
                {
                    resource.VaultMeta.AiSummary = result.Summary;
                    resource.VaultMeta.SuggestedCategoryName = result.SuggestedCategoryName;
                    if (resource.VaultMeta.PromotedToVaultAt == null)
                    {
                        resource.VaultMeta.PromotedToVaultAt = DateTime.UtcNow;
                    }
                }

                if (resource.InboxMeta != null)
                {
                    _context.InboxMetadata.Remove(resource.InboxMeta);
                    resource.InboxMeta = null;
                }

                if (!string.IsNullOrWhiteSpace(result.SuggestedCategoryName))
                {
                    var matchedCategoryId =
                        await _categoryService.GetIdByNameAsync(resource.UserId, result.SuggestedCategoryName);

                    if (matchedCategoryId.HasValue)
                    {
                        resource.VaultMeta.CategoryId = matchedCategoryId.Value;
                        resource.VaultMeta.SuggestedCategoryName = null;
                    }
                }

                resource.Status = ResourceStatus.Vault;
            }
            else
            {
                var result = await _aiService.AnalyzeForInboxAsync(resource, preferences, extraContent);

                resource.CorrectedTitle = result.CorrectedTitle;
                tagsToProcess = result.SuggestedTags;

                if (resource.InboxMeta == null)
                {
                    resource.InboxMeta = new InboxMetadata { ResourceId = resource.Id };
                }

                InboxMetadataMapper.ApplyAnalysis(resource.InboxMeta, result);

                resource.Status = ResourceStatus.Inbox;
            }

            await UpdateTagsAsync(resource, tagsToProcess);

            await _context.SaveChangesAsync();
            _logger.LogInformation($"AI Analysis completed for {resource.Title}. Status: {resource.Status}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "AI Analysis failed for resource {ResourceId}", resourceId);

            if (resource.IsVaultTarget)
            {
                var retryCount = context?.GetJobParameter<int>("RetryCount") ?? 0;
                if (retryCount >= 2)
                {
                    await ApplyVaultFallbackAsync(resource, ex);
                    return;
                }

                throw;
            }

            resource.Status = ResourceStatus.Error;
            try
            {
                await _context.SaveChangesAsync();
            }
            catch
            {
            }

            throw;
        }
    }

    internal async Task ApplyVaultFallbackAsync(Resource resource, Exception ex)
    {
        _logger.LogError(ex,
            "Vault-target AI analysis exhausted retries for {ResourceId}; applying minimal vault metadata",
            resource.Id);

        if (resource.VaultMeta == null)
        {
            resource.VaultMeta = new VaultMetadata
            {
                ResourceId = resource.Id,
                PromotedToVaultAt = DateTime.UtcNow
            };
        }
        else if (resource.VaultMeta.PromotedToVaultAt == null)
        {
            resource.VaultMeta.PromotedToVaultAt = DateTime.UtcNow;
        }

        var summary = resource.Description;
        if (string.IsNullOrWhiteSpace(summary) || summary == resource.Title)
        {
            summary = !string.IsNullOrWhiteSpace(resource.Title) &&
                      resource.Title != "Waiting for analysis..."
                ? resource.Title
                : resource.Url;
        }

        resource.VaultMeta.AiSummary = summary.Length > 500 ? summary[..500] : summary;
        resource.VaultMeta.SuggestedCategoryName = null;

        if (resource.InboxMeta != null)
        {
            _context.InboxMetadata.Remove(resource.InboxMeta);
            resource.InboxMeta = null;
        }

        resource.Status = ResourceStatus.Vault;
        await _context.SaveChangesAsync();
    }

    private async Task UpdateTagsAsync(Resource resource, string[] tags)
    {
        foreach (var tagName in tags)
        {
            var normalizedTagName = tagName.Trim().ToLowerInvariant();
            if (string.IsNullOrWhiteSpace(normalizedTagName)) continue;

            var existingTag = await _context.Tags
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(t => t.UserId == resource.UserId && t.Name == normalizedTagName);

            if (existingTag != null)
            {
                if (!resource.Tags.Contains(existingTag)) resource.Tags.Add(existingTag);
            }
            else
            {
                var newTag = new Tag
                {
                    Name = normalizedTagName,
                    UserId = resource.UserId
                };
                resource.Tags.Add(newTag);
            }
        }
    }
}