using KnowledgeOS.Backend.Entities.Resources;

namespace KnowledgeOS.Backend.Services.Ai.Abstractions;

public interface IAiService
{
    Task<AiAnalysisResult> AnalyzeResourceAsync(Resource resource, string userPreferences,string? extraContent = null);
}

public record AiAnalysisResult(
    int Score,
    string Verdict,
    string Summary,
    string[] SuggestedTags
);