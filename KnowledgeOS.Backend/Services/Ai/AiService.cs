using KnowledgeOS.Backend.Entities.Resources;
using KnowledgeOS.Backend.Services.Abstractions;
using KnowledgeOS.Backend.Services.Ai.Abstractions;

namespace KnowledgeOS.Backend.Services.Ai;

public class AiService : IAiService
{
    private readonly IEnumerable<IAiProvider> _providers;
    private readonly ILogger<AiService> _logger;

    public AiService(IEnumerable<IAiProvider> providers, ILogger<AiService> logger)
    {
        _providers = providers;
        _logger = logger;
    }

    public async Task<InboxAnalysisResult> AnalyzeForInboxAsync(Resource resource, string userPreferences, string? extraContent = null)
    {
        var exceptions = new List<Exception>();
        foreach (var provider in _providers)
        {
            try
            {
                _logger.LogInformation($"Attempting INBOX analysis using: {provider.Name}");
                return await provider.AnalyzeForInboxAsync(resource, userPreferences, extraContent);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, $"Provider {provider.Name} failed (Inbox). Trying next...");
                exceptions.Add(ex);
            }
        }

        _logger.LogError("All AI providers failed for Inbox analysis.");
        throw new AggregateException("All AI providers failed to analyze the resource for Inbox.", exceptions);
    }

    public async Task<VaultAnalysisResult> AnalyzeForVaultAsync(Resource resource, string userPreferences, List<string> existingCategories,string? extraContent = null)
    {
        var exceptions = new List<Exception>();
        foreach (var provider in _providers)
        {
            try
            {
                _logger.LogInformation($"Attempting VAULT analysis using: {provider.Name}");
                return await provider.AnalyzeForVaultAsync(resource, userPreferences,existingCategories, extraContent);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, $"Provider {provider.Name} failed (Vault). Trying next...");
                exceptions.Add(ex);
            }
        }

        _logger.LogError("All AI providers failed for Vault analysis.");
        throw new AggregateException("All AI providers failed to analyze the resource for Vault.", exceptions);
    }
}