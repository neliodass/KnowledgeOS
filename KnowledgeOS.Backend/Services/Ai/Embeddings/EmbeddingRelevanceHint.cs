using KnowledgeOS.Backend.Services.Ai.Scoring;

namespace KnowledgeOS.Backend.Services.Ai.Embeddings;

public record EmbeddingRelevanceHint(
    RelevanceTier SuggestedTier,
    double Similarity
);
