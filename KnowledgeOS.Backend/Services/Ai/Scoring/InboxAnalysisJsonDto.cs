using System.Text.Json.Serialization;

namespace KnowledgeOS.Backend.Services.Ai.Scoring;

public class InboxAnalysisJsonDto
{
    public string? CorrectedTitle { get; set; }

    [JsonPropertyName("intrinsicQuality")]
    public string? IntrinsicQuality { get; set; }

    [JsonPropertyName("relevance")]
    public string? Relevance { get; set; }

    [JsonPropertyName("matchesAvoidance")]
    public bool MatchesAvoidance { get; set; }

    public string? Verdict { get; set; }
    public string? Summary { get; set; }
    public string[]? SuggestedTags { get; set; }

    public InboxAnalysisTiers ToTiers(bool hasContentSnippet)
    {
        var quality = ParseIntrinsicQuality(IntrinsicQuality);
        var relevance = ParseRelevance(Relevance);

        if (!hasContentSnippet)
        {
            quality = IntrinsicQualityTier.InsufficientData;
            relevance = RelevanceTier.None;
        }
        else if (quality == IntrinsicQualityTier.InsufficientData)
        {
            relevance = RelevanceTier.None;
        }

        return new InboxAnalysisTiers(
            quality,
            relevance,
            MatchesAvoidance,
            ScoredFromMetadataOnly: !hasContentSnippet || quality == IntrinsicQualityTier.InsufficientData);
    }

    private static IntrinsicQualityTier ParseIntrinsicQuality(string? value) =>
        value?.Trim().ToLowerInvariant() switch
        {
            "high" => IntrinsicQualityTier.High,
            "low" => IntrinsicQualityTier.Low,
            "insufficient_data" => IntrinsicQualityTier.InsufficientData,
            _ => throw new InvalidOperationException($"Invalid intrinsicQuality: '{value}'")
        };

    private static RelevanceTier ParseRelevance(string? value) =>
        value?.Trim().ToLowerInvariant() switch
        {
            "professional" => RelevanceTier.Professional,
            "hobby" => RelevanceTier.Hobby,
            "discovery" => RelevanceTier.Discovery,
            "standard" => RelevanceTier.Standard,
            "none" => RelevanceTier.None,
            _ => throw new InvalidOperationException($"Invalid relevance: '{value}'")
        };
}
