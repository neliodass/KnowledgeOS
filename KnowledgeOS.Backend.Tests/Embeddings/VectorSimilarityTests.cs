using KnowledgeOS.Backend.Services.Ai.Embeddings;
using KnowledgeOS.Backend.Services.Ai.Scoring;

namespace KnowledgeOS.Backend.Tests.Embeddings;

public class VectorSimilarityTests
{
    [Fact]
    public void Cosine_identical_vectors_returns_one()
    {
        var v = new float[] { 1, 0, 0 };
        Assert.Equal(1, VectorSimilarity.Cosine(v, v), 3);
    }

    [Fact]
    public void Harmonize_downgrades_hobby_when_similarity_low()
    {
        var result = RelevanceTierHarmonizer.Harmonize(
            RelevanceTier.Hobby,
            RelevanceTier.Hobby,
            similarity: 0.2);

        Assert.Equal(RelevanceTier.Standard, result);
    }

    [Fact]
    public void MapSimilarity_maps_high_score_to_hobby()
    {
        Assert.Equal(RelevanceTier.Hobby, RelevanceEmbeddingMatcher.MapSimilarityToTier(0.8));
    }
}
