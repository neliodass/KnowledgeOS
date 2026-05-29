using KnowledgeOS.Backend.Entities.Resources;
using KnowledgeOS.Backend.Services.Ai.Abstractions;
using KnowledgeOS.Backend.Services.Ai.Scoring;

namespace KnowledgeOS.Backend.Services;

public static class InboxMetadataMapper
{
    public static void ApplyAnalysis(InboxMetadata meta, InboxAnalysisResult result)
    {
        meta.SubstanceDepth = InboxTierLabels.ToStorageString(result.Tiers.SubstanceDepth);
        meta.ContentIntent = InboxTierLabels.ToStorageString(result.Tiers.ContentIntent);
        meta.Relevance = InboxTierLabels.ToStorageString(result.Tiers.Relevance);
        meta.Takeaway = Truncate(result.Takeaway, 120);
        meta.SortPriority = result.SortPriority;
        meta.MatchesAvoidance = result.Tiers.MatchesAvoidance;
        meta.ScoredFromMetadataOnly = result.ScoredFromMetadataOnly;
        meta.AiVerdict = result.Verdict;
        meta.AiSummary = result.Summary;
    }

    public static int GetEffectiveSortPriority(InboxMetadata? meta)
    {
        if (meta == null)
            return 0;

        if (meta.SortPriority > 0)
            return meta.SortPriority;

        if (meta.AiScore.HasValue)
            return InboxSortPriority.FromLegacyAiScore(meta.AiScore.Value);

        return 0;
    }

    private static string Truncate(string value, int maxLength) =>
        value.Length <= maxLength ? value : value[..maxLength];
}
