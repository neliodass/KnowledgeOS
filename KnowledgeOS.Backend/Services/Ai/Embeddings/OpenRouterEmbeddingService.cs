using OpenAI;
using OpenAI.Embeddings;
using Pgvector;

namespace KnowledgeOS.Backend.Services.Ai.Embeddings;

public class OpenRouterEmbeddingService : IEmbeddingService
{
    private readonly OpenAIClient _openAiClient;
    private readonly string _modelId;
    private readonly ILogger<OpenRouterEmbeddingService> _logger;

    public OpenRouterEmbeddingService(
        OpenAIClient openAiClient,
        IConfiguration configuration,
        ILogger<OpenRouterEmbeddingService> logger)
    {
        _openAiClient = openAiClient;
        _logger = logger;
        _modelId = configuration["Ai:EmbeddingModel"]
                   ?? "openai/text-embedding-3-small";
    }

    public async Task<Vector?> TryEmbedAsync(string text, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(text))
            return null;

        try
        {
            var client = _openAiClient.GetEmbeddingClient(_modelId);
            OpenAIEmbedding embedding = await client.GenerateEmbeddingAsync(text, cancellationToken: cancellationToken);
            var floats = embedding.ToFloats();
            return new Vector(floats);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Embedding failed for model {Model}", _modelId);
            return null;
        }
    }
}
