using KnowledgeOS.Backend.Services.Ai.Scoring;

namespace KnowledgeOS.Backend.Tests.Scoring;

public class InboxAnalysisJsonDtoTests
{
    [Fact]
    public void ToTiers_without_snippet_forces_insufficient_data_and_none_relevance()
    {
        var dto = new InboxAnalysisJsonDto
        {
            SubstanceDepth = "deep",
            ContentIntent = "entertain",
            Relevance = "hobby",
            MatchesAvoidance = false
        };

        var tiers = dto.ToTiers(hasContentSnippet: false);

        Assert.Equal(SubstanceDepthTier.InsufficientData, tiers.SubstanceDepth);
        Assert.Equal(ContentIntentTier.Mixed, tiers.ContentIntent);
        Assert.Equal(RelevanceTier.None, tiers.Relevance);
        Assert.True(tiers.ScoredFromMetadataOnly);
    }

    [Fact]
    public void ToTiers_with_insufficient_data_sets_none_relevance()
    {
        var dto = new InboxAnalysisJsonDto
        {
            SubstanceDepth = "insufficient_data",
            ContentIntent = "mixed",
            Relevance = "professional",
            MatchesAvoidance = false
        };

        var tiers = dto.ToTiers(hasContentSnippet: true);

        Assert.Equal(SubstanceDepthTier.InsufficientData, tiers.SubstanceDepth);
        Assert.Equal(RelevanceTier.None, tiers.Relevance);
        Assert.True(tiers.ScoredFromMetadataOnly);
    }

    [Fact]
    public void ToTiers_with_snippet_preserves_parsed_tiers()
    {
        var dto = new InboxAnalysisJsonDto
        {
            SubstanceDepth = "deep",
            ContentIntent = "learn",
            Relevance = "discovery",
            MatchesAvoidance = false
        };

        var tiers = dto.ToTiers(hasContentSnippet: true);

        Assert.Equal(SubstanceDepthTier.Deep, tiers.SubstanceDepth);
        Assert.Equal(ContentIntentTier.Learn, tiers.ContentIntent);
        Assert.Equal(RelevanceTier.Discovery, tiers.Relevance);
        Assert.False(tiers.ScoredFromMetadataOnly);
    }

    [Theory]
    [InlineData("invalid")]
    [InlineData("")]
    [InlineData(null)]
    public void ToTiers_throws_on_invalid_substance_depth(string? depth)
    {
        var dto = new InboxAnalysisJsonDto
        {
            SubstanceDepth = depth,
            ContentIntent = "mixed",
            Relevance = "none"
        };

        Assert.Throws<InvalidOperationException>(() => dto.ToTiers(hasContentSnippet: true));
    }
}
