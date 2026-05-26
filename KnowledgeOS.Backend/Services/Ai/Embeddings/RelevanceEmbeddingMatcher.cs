using KnowledgeOS.Backend.Entities.Resources;
using KnowledgeOS.Backend.Entities.Users;
using KnowledgeOS.Backend.Services.Ai.Scoring;
using Pgvector;

namespace KnowledgeOS.Backend.Services.Ai.Embeddings;

public class RelevanceEmbeddingMatcher
{
    private readonly IEmbeddingService _embeddingService;

    public RelevanceEmbeddingMatcher(IEmbeddingService embeddingService)
    {
        _embeddingService = embeddingService;
    }

    public async Task<EmbeddingRelevanceHint?> TryMatchAsync(
        UserPreference? prefs,
        Resource resource,
        string? contentSnippet,
        CancellationToken cancellationToken = default)
    {
        if (prefs?.ProfileEmbedding == null)
            return null;

        var resourceText = BuildResourceText(resource, contentSnippet);
        var resourceVector = await _embeddingService.TryEmbedAsync(resourceText, cancellationToken);
        if (resourceVector == null)
            return null;

        var similarity = VectorSimilarity.Cosine(
            prefs.ProfileEmbedding.ToArray(),
            resourceVector.ToArray());

        var tier = MapSimilarityToTier(similarity);
        return new EmbeddingRelevanceHint(tier, similarity);
    }

    public static string BuildResourceText(Resource resource, string? contentSnippet)
    {
        var snippet = contentSnippet?.Length > 2500 ? contentSnippet[..2500] : contentSnippet;
        return $"""
                Title: {resource.Title}
                Description: {resource.Description ?? ""}
                Content: {snippet ?? ""}
                """;
    }

    public static RelevanceTier MapSimilarityToTier(double similarity) =>
        similarity switch
        {
            >= 0.72 => RelevanceTier.Hobby,
            >= 0.58 => RelevanceTier.Discovery,
            >= 0.38 => RelevanceTier.Standard,
            _ => RelevanceTier.None
        };
}
