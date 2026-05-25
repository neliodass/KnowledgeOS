using KnowledgeOS.Backend.Services.Ai.Scoring;

namespace KnowledgeOS.Backend.Tests.Scoring;

public class ScoreCalculatorTests
{
    [Theory]
    [InlineData(IntrinsicQualityTier.High, RelevanceTier.Professional, false, 92)]
    [InlineData(IntrinsicQualityTier.High, RelevanceTier.Hobby, false, 80)]
    [InlineData(IntrinsicQualityTier.High, RelevanceTier.Discovery, false, 67)]
    [InlineData(IntrinsicQualityTier.High, RelevanceTier.Standard, false, 47)]
    [InlineData(IntrinsicQualityTier.High, RelevanceTier.None, false, 47)]
    [InlineData(IntrinsicQualityTier.Low, RelevanceTier.Professional, false, 15)]
    [InlineData(IntrinsicQualityTier.InsufficientData, RelevanceTier.None, false, 45)]
    public void Compute_maps_quality_and_relevance_deterministically(
        IntrinsicQualityTier quality,
        RelevanceTier relevance,
        bool matchesAvoidance,
        int expected)
    {
        var tiers = new InboxAnalysisTiers(quality, relevance, matchesAvoidance, false);

        var score = ScoreCalculator.Compute(tiers);

        Assert.Equal(expected, score);
    }

    [Fact]
    public void Compute_when_matchesAvoidance_returns_capped_score_regardless_of_quality()
    {
        var tiers = new InboxAnalysisTiers(
            IntrinsicQualityTier.High,
            RelevanceTier.Professional,
            MatchesAvoidance: true,
            ScoredFromMetadataOnly: false);

        Assert.Equal(8, ScoreCalculator.Compute(tiers));
    }
}
