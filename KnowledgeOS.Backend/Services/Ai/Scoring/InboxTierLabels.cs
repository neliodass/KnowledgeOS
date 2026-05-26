namespace KnowledgeOS.Backend.Services.Ai.Scoring;

public static class InboxTierLabels
{
    public static string ToStorageString(SubstanceDepthTier tier) =>
        tier switch
        {
            SubstanceDepthTier.Deep => "deep",
            SubstanceDepthTier.Moderate => "moderate",
            SubstanceDepthTier.Shallow => "shallow",
            SubstanceDepthTier.InsufficientData => "insufficient_data",
            _ => "insufficient_data"
        };

    public static string ToStorageString(ContentIntentTier tier) =>
        tier switch
        {
            ContentIntentTier.Learn => "learn",
            ContentIntentTier.Entertain => "entertain",
            ContentIntentTier.Inspire => "inspire",
            ContentIntentTier.News => "news",
            ContentIntentTier.Mixed => "mixed",
            _ => "mixed"
        };

    public static string ToStorageString(RelevanceTier tier) =>
        tier switch
        {
            RelevanceTier.Professional => "professional",
            RelevanceTier.Hobby => "hobby",
            RelevanceTier.Discovery => "discovery",
            RelevanceTier.Standard => "standard",
            RelevanceTier.None => "none",
            _ => "none"
        };

    public static SubstanceDepthTier? ParseSubstanceDepth(string? value) =>
        value?.Trim().ToLowerInvariant() switch
        {
            "deep" => SubstanceDepthTier.Deep,
            "moderate" => SubstanceDepthTier.Moderate,
            "shallow" => SubstanceDepthTier.Shallow,
            "insufficient_data" => SubstanceDepthTier.InsufficientData,
            _ => null
        };

    public static ContentIntentTier? ParseContentIntent(string? value) =>
        value?.Trim().ToLowerInvariant() switch
        {
            "learn" => ContentIntentTier.Learn,
            "entertain" => ContentIntentTier.Entertain,
            "inspire" => ContentIntentTier.Inspire,
            "news" => ContentIntentTier.News,
            "mixed" => ContentIntentTier.Mixed,
            _ => null
        };

    public static RelevanceTier? ParseRelevance(string? value) =>
        value?.Trim().ToLowerInvariant() switch
        {
            "professional" => RelevanceTier.Professional,
            "hobby" => RelevanceTier.Hobby,
            "discovery" => RelevanceTier.Discovery,
            "standard" => RelevanceTier.Standard,
            "none" => RelevanceTier.None,
            _ => null
        };
}
