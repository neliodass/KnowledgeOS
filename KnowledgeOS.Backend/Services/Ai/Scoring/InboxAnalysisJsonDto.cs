using System.Text.Json.Serialization;

namespace KnowledgeOS.Backend.Services.Ai.Scoring;

public class InboxAnalysisJsonDto
{
    public string? CorrectedTitle { get; set; }

    [JsonPropertyName("substanceDepth")]
    public string? SubstanceDepth { get; set; }

    [JsonPropertyName("contentIntent")]
    public string? ContentIntent { get; set; }

    [JsonPropertyName("relevance")]
    public string? Relevance { get; set; }

    [JsonPropertyName("matchesAvoidance")]
    public bool MatchesAvoidance { get; set; }

    [JsonPropertyName("takeaway")]
    public string? Takeaway { get; set; }

    public string? Verdict { get; set; }
    public string? Summary { get; set; }
    public string[]? SuggestedTags { get; set; }

    public InboxAnalysisTiers ToTiers(bool hasContentSnippet)
    {
        var substance = ParseSubstanceDepth(SubstanceDepth);
        var intent = ParseContentIntent(ContentIntent);
        var relevance = ParseRelevance(Relevance);

        if (!hasContentSnippet)
        {
            substance = SubstanceDepthTier.InsufficientData;
            intent = ContentIntentTier.Mixed;
            relevance = RelevanceTier.None;
        }
        else if (substance == SubstanceDepthTier.InsufficientData)
        {
            relevance = RelevanceTier.None;
        }

        return new InboxAnalysisTiers(substance, intent, relevance, MatchesAvoidance,
            ScoredFromMetadataOnly: !hasContentSnippet || substance == SubstanceDepthTier.InsufficientData);
    }

    private static SubstanceDepthTier ParseSubstanceDepth(string? value) =>
        value?.Trim().ToLowerInvariant() switch
        {
            "deep" => SubstanceDepthTier.Deep,
            "moderate" => SubstanceDepthTier.Moderate,
            "shallow" => SubstanceDepthTier.Shallow,
            "insufficient_data" => SubstanceDepthTier.InsufficientData,
            _ => throw new InvalidOperationException($"Invalid substanceDepth: '{value}'")
        };

    private static ContentIntentTier ParseContentIntent(string? value) =>
        value?.Trim().ToLowerInvariant() switch
        {
            "learn" => ContentIntentTier.Learn,
            "entertain" => ContentIntentTier.Entertain,
            "inspire" => ContentIntentTier.Inspire,
            "news" => ContentIntentTier.News,
            "mixed" => ContentIntentTier.Mixed,
            _ => throw new InvalidOperationException($"Invalid contentIntent: '{value}'")
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
