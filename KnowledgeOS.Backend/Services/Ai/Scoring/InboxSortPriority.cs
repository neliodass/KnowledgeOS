namespace KnowledgeOS.Backend.Services.Ai.Scoring;

/// <summary>
/// Deterministic inbox ordering: relevance first, then substance depth. Avoidance sinks to bottom.
/// </summary>
public static class InboxSortPriority
{
    public static int Compute(InboxAnalysisTiers tiers)
    {
        if (tiers.MatchesAvoidance)
            return 0;

        var relevance = tiers.Relevance switch
        {
            RelevanceTier.Professional => 500,
            RelevanceTier.Hobby => 400,
            RelevanceTier.Discovery => 300,
            RelevanceTier.Standard => 200,
            RelevanceTier.None => 100,
            _ => 100
        };

        var substance = tiers.SubstanceDepth switch
        {
            SubstanceDepthTier.Deep => 40,
            SubstanceDepthTier.Moderate => 25,
            SubstanceDepthTier.Shallow => 10,
            SubstanceDepthTier.InsufficientData => 5,
            _ => 5
        };

        return relevance + substance;
    }

    /// <summary>Legacy rows analyzed before multi-axis scoring.</summary>
    public static int FromLegacyAiScore(int aiScore) =>
        aiScore switch
        {
            >= 75 => 540,
            >= 40 => 325,
            > 0 => 210,
            _ => 105
        };
}
