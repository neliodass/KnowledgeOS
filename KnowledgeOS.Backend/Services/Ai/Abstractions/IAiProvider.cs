using KnowledgeOS.Backend.Entities.Resources;

namespace KnowledgeOS.Backend.Services.Ai.Abstractions;

public interface IAiProvider
{
    string Name { get; }

    Task<InboxAnalysisResult> AnalyzeForInboxAsync(Resource resource, string userPreferences,
        string? extraContext = null);

    Task<VaultAnalysisResult> AnalyzeForVaultAsync(Resource resource, string userPreferences,
        List<string> existingCategories,
        string? extraContext = null);
}