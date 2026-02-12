using KnowledgeOS.Backend.Entities.Resources;

namespace KnowledgeOS.Backend.Services.Ai.Abstractions;

public interface IAiService
{
    Task<InboxAnalysisResult> AnalyzeForInboxAsync(Resource resource, string userPreferences,
        string? extraContent = null);

    Task<VaultAnalysisResult> AnalyzeForVaultAsync(Resource resource, string userPreferences,
        List<string> existingCategories, string? extraContent = null);
}

public record InboxAnalysisResult(
    string CorrectedTitle,
    int Score,
    string Verdict,
    string Summary,
    string[] SuggestedTags
);

public record VaultAnalysisResult(
    string CorrectedTitle,
    string Summary,
    string[] SuggestedTags,
    string SuggestedCategoryName
);