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

    public async Task<AiAnalysisResult> AnalyzeResourceAsync(Resource resource, string userPreferences, string? extraContext = null)
    {
        var exceptions = new List<Exception>();
        foreach (var provider in _providers)
        {
            try
            {
                _logger.LogInformation($"Attempting AI analysis using: {provider.Name}");
                return await provider.AnalyzeAsync(resource, userPreferences, extraContext);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, $"Provider {provider.Name} failed. Trying next...");
                exceptions.Add(ex);
            }
        }

        _logger.LogError("All AI providers failed.");
        throw new AggregateException("All AI providers failed to analyze the resource.", exceptions);
    }
}