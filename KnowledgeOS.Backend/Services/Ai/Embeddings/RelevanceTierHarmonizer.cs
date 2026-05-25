using KnowledgeOS.Backend.Services.Ai.Scoring;

namespace KnowledgeOS.Backend.Services.Ai.Embeddings;

public static class RelevanceTierHarmonizer
{
    public static string HarmonizeLlmRelevance(string? llmRelevance, EmbeddingRelevanceHint hint)
    {
        var llmTier = ParseLlmTier(llmRelevance);
        var adjusted = Harmonize(llmTier, hint.SuggestedTier, hint.Similarity);
        return ToJsonValue(adjusted);
    }

    public static RelevanceTier Harmonize(RelevanceTier llm, RelevanceTier hint, double similarity)
    {
        if (similarity < 0.32 && llm is RelevanceTier.Hobby or RelevanceTier.Professional)
            return RelevanceTier.Standard;

        if (similarity >= 0.68 && llm is RelevanceTier.Standard or RelevanceTier.None)
            return hint;

        if (similarity >= 0.72 && llm == RelevanceTier.Discovery && hint == RelevanceTier.Hobby)
            return RelevanceTier.Hobby;

        return llm;
    }

    private static RelevanceTier ParseLlmTier(string? value) =>
        value?.Trim().ToLowerInvariant() switch
        {
            "professional" => RelevanceTier.Professional,
            "hobby" => RelevanceTier.Hobby,
            "discovery" => RelevanceTier.Discovery,
            "standard" => RelevanceTier.Standard,
            "none" => RelevanceTier.None,
            _ => RelevanceTier.Standard
        };

    private static string ToJsonValue(RelevanceTier tier) =>
        tier switch
        {
            RelevanceTier.Professional => "professional",
            RelevanceTier.Hobby => "hobby",
            RelevanceTier.Discovery => "discovery",
            RelevanceTier.Standard => "standard",
            RelevanceTier.None => "none",
            _ => "standard"
        };
}
