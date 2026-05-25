using KnowledgeOS.Backend.Services.Ai.Scoring;

namespace KnowledgeOS.Backend.Tests.Scoring;

public class InboxAnalysisJsonDtoTests
{
    [Fact]
    public void ToTiers_without_snippet_forces_insufficient_data_and_none_relevance()
    {
        var dto = new InboxAnalysisJsonDto
        {
            IntrinsicQuality = "high",
            Relevance = "hobby",
            MatchesAvoidance = false
        };

        var tiers = dto.ToTiers(hasContentSnippet: false);

        Assert.Equal(IntrinsicQualityTier.InsufficientData, tiers.IntrinsicQuality);
        Assert.Equal(RelevanceTier.None, tiers.Relevance);
        Assert.True(tiers.ScoredFromMetadataOnly);
    }

    [Fact]
    public void ToTiers_with_insufficient_data_quality_sets_none_relevance()
    {
        var dto = new InboxAnalysisJsonDto
        {
            IntrinsicQuality = "insufficient_data",
            Relevance = "professional",
            MatchesAvoidance = false
        };

        var tiers = dto.ToTiers(hasContentSnippet: true);

        Assert.Equal(IntrinsicQualityTier.InsufficientData, tiers.IntrinsicQuality);
        Assert.Equal(RelevanceTier.None, tiers.Relevance);
        Assert.True(tiers.ScoredFromMetadataOnly);
    }

    [Fact]
    public void ToTiers_with_snippet_preserves_parsed_tiers()
    {
        var dto = new InboxAnalysisJsonDto
        {
            IntrinsicQuality = "high",
            Relevance = "discovery",
            MatchesAvoidance = false
        };

        var tiers = dto.ToTiers(hasContentSnippet: true);

        Assert.Equal(IntrinsicQualityTier.High, tiers.IntrinsicQuality);
        Assert.Equal(RelevanceTier.Discovery, tiers.Relevance);
        Assert.False(tiers.ScoredFromMetadataOnly);
    }

    [Theory]
    [InlineData("invalid")]
    [InlineData("")]
    [InlineData(null)]
    public void ToTiers_throws_on_invalid_intrinsic_quality(string? quality)
    {
        var dto = new InboxAnalysisJsonDto { IntrinsicQuality = quality, Relevance = "none" };

        Assert.Throws<InvalidOperationException>(() => dto.ToTiers(hasContentSnippet: true));
    }
}
