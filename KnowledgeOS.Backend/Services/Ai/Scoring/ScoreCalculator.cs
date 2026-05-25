namespace KnowledgeOS.Backend.Services.Ai.Scoring;

public static class ScoreCalculator
{
    public static int Compute(InboxAnalysisTiers tiers)
    {
        if (tiers.MatchesAvoidance)
            return 8;

        var score = tiers.IntrinsicQuality switch
        {
            IntrinsicQualityTier.InsufficientData => 45,
            IntrinsicQualityTier.Low => 15,
            IntrinsicQualityTier.High => tiers.Relevance switch
            {
                RelevanceTier.Professional => 92,
                RelevanceTier.Hobby => 80,
                RelevanceTier.Discovery => 67,
                RelevanceTier.Standard => 47,
                RelevanceTier.None => 47,
                _ => 47
            },
            _ => 45
        };

        return Math.Clamp(score, 0, 100);
    }
}
