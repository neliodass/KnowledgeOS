using Hangfire;
using KnowledgeOS.Backend.Data;
using KnowledgeOS.Backend.Entities.Resources;
using KnowledgeOS.Backend.Entities.Tagging;
using KnowledgeOS.Backend.Jobs.Abstractions;
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
    public async Task ProcessAsync(Guid resourceId)
    {
        _logger.LogInformation($"Starting AI Analysis for resource: {resourceId}");
        var resource = await _context.Resources
            .IgnoreQueryFilters()
            .Include(r => r.Tags)
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

            var userContext = preferences?.ToAiPromptContext()
                              ?? "Role: General Learner. Interests: General Knowledge. Avoid: Nothing specific.";

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
                    await _aiService.AnalyzeForVaultAsync(resource, userContext, existingCategories, extraContent);

                resource.CorrectedTitle = result.CorrectedTitle;
                resource.AiSummary = result.Summary;
                tagsToProcess = result.SuggestedTags;

                if (!string.IsNullOrWhiteSpace(result.SuggestedCategoryName))
                {
                    var matchedCategoryId =
                        await _categoryService.GetIdByNameAsync(resource.UserId, result.SuggestedCategoryName);

                    if (matchedCategoryId.HasValue)
                    {
                        resource.CategoryId = matchedCategoryId.Value;
                    }
                    else
                    {
                        //TODO : ewentualnie dodać pole SuggestedNewCategoryName 
                    }
                }

                resource.Status = ResourceStatus.Vault;
            }
            else
            {
                var result = await _aiService.AnalyzeForInboxAsync(resource, userContext, extraContent);

                resource.CorrectedTitle = result.CorrectedTitle;
                resource.AiScore = result.Score;
                resource.AiVerdict = result.Verdict;
                resource.AiSummary = result.Summary;
                tagsToProcess = result.SuggestedTags;

                resource.Status = ResourceStatus.Inbox;
            }

            await UpdateTagsAsync(resource, tagsToProcess);

            await _context.SaveChangesAsync();
            _logger.LogInformation($"AI Analysis completed for {resource.Title}. Status: {resource.Status}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"AI Analysis failed for resource {resourceId}");
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

    private async Task UpdateTagsAsync(Resource resource, string[] tags)
    {
        resource.Tags.Clear();

        foreach (var tagName in tags)
        {
            var normalizedTagName = tagName.Trim().ToLowerInvariant();
            if (string.IsNullOrWhiteSpace(normalizedTagName)) continue;

            var existingTag = await _context.Tags
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(t => t.UserId == resource.UserId && t.Name == normalizedTagName);

            if (existingTag != null)
            {
                if (!resource.Tags.Contains(existingTag))
                {
                    resource.Tags.Add(existingTag);
                }
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