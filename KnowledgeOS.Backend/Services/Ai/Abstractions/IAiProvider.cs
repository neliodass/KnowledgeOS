using KnowledgeOS.Backend.Entities.Resources;
using KnowledgeOS.Backend.Entities.Users;

namespace KnowledgeOS.Backend.Services.Ai.Abstractions;

public interface IAiProvider
{
    string Name { get; }

    Task<InboxAnalysisResult> AnalyzeForInboxAsync(Resource resource, UserPreference? preferences,
        string? extraContext = null);

    Task<VaultAnalysisResult> AnalyzeForVaultAsync(Resource resource, UserPreference? preferences,
        List<string> existingCategories,
        string? extraContext = null);
}