using Pgvector;

namespace KnowledgeOS.Backend.Services.Ai.Embeddings;

public interface IEmbeddingService
{
    Task<Vector?> TryEmbedAsync(string text, CancellationToken cancellationToken = default);
}
