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
    private readonly ILogger<AiAnalysisJob> _logger;

    public AiAnalysisJob(
        AppDbContext context,
        IAiService aiService,
        IEnumerable<IContentFetcher> contentFetchers,
        ILogger<AiAnalysisJob> logger)
    {
        _context = context;
        _aiService = aiService;
        _contentFetchers = contentFetchers;
        _logger = logger;
    }

    [AutomaticRetry(Attempts = 3, OnAttemptsExceeded = AttemptsExceededAction.Fail)]
    public async Task ProcessAsync(Guid resourceId)
    {
        _logger.LogInformation($"Starting AI Analysis for resource: {resourceId}");

        // Get the resource
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


            var analysisResult = await _aiService.AnalyzeResourceAsync(resource, userContext, extraContent);
            resource.CorrectedTitle = analysisResult.CorrectedTitle;
            resource.AiScore = analysisResult.Score;
            resource.AiVerdict = analysisResult.Verdict;
            resource.AiSummary = analysisResult.Summary;

            resource.Tags.Clear();

            foreach (var tagName in analysisResult.SuggestedTags)
            {
                //normalilze tag name
                var normalizedTagName = tagName.Trim().ToLowerInvariant();
                if (string.IsNullOrWhiteSpace(normalizedTagName)) continue;

                // check existance for this user
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

            resource.Status = ResourceStatus.Inbox;

            await _context.SaveChangesAsync();
            _logger.LogInformation($"AI Analysis completed for {resource.Title}. Score: {resource.AiScore}");
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
}