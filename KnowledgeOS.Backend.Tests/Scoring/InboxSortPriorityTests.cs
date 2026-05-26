using KnowledgeOS.Backend.Services.Ai.Scoring;

namespace KnowledgeOS.Backend.Tests.Scoring;

public class InboxSortPriorityTests
{
    [Fact]
    public void Compute_professional_deep_ranks_highest_among_normal_items()
    {
        var tiers = new InboxAnalysisTiers(
            SubstanceDepthTier.Deep,
            ContentIntentTier.Learn,
            RelevanceTier.Professional,
            MatchesAvoidance: false,
            ScoredFromMetadataOnly: false);

        Assert.Equal(540, InboxSortPriority.Compute(tiers));
    }

    [Fact]
    public void Compute_avoidance_returns_zero()
    {
        var tiers = new InboxAnalysisTiers(
            SubstanceDepthTier.Deep,
            ContentIntentTier.Learn,
            RelevanceTier.Professional,
            MatchesAvoidance: true,
            ScoredFromMetadataOnly: false);

        Assert.Equal(0, InboxSortPriority.Compute(tiers));
    }

    [Theory]
    [InlineData(80, 540)]
    [InlineData(50, 325)]
    [InlineData(20, 210)]
    public void FromLegacyAiScore_maps_old_buckets(int score, int expected) =>
        Assert.Equal(expected, InboxSortPriority.FromLegacyAiScore(score));
}
