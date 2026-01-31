using KnowledgeOS.Backend.Entities.Resources;

namespace KnowledgeOS.Backend.Services.Ai.Abstractions;

public interface IAiProvider
{
    string Name { get; }
    
    Task<AiAnalysisResult> AnalyzeAsync(Resource resource, string userPreferences, string? extraContext = null);
}