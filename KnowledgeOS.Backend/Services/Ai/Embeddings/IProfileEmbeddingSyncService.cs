namespace KnowledgeOS.Backend.Services.Ai.Embeddings;

public interface IProfileEmbeddingSyncService
{
    Task SyncForUserAsync(string userId, CancellationToken cancellationToken = default);
}
