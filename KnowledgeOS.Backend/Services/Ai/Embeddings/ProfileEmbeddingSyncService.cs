using KnowledgeOS.Backend.Data;
using Microsoft.EntityFrameworkCore;

namespace KnowledgeOS.Backend.Services.Ai.Embeddings;

public class ProfileEmbeddingSyncService : IProfileEmbeddingSyncService
{
    private readonly AppDbContext _context;
    private readonly IEmbeddingService _embeddingService;
    private readonly ILogger<ProfileEmbeddingSyncService> _logger;

    public ProfileEmbeddingSyncService(
        AppDbContext context,
        IEmbeddingService embeddingService,
        ILogger<ProfileEmbeddingSyncService> logger)
    {
        _context = context;
        _embeddingService = embeddingService;
        _logger = logger;
    }

    public async Task SyncForUserAsync(string userId, CancellationToken cancellationToken = default)
    {
        var prefs = await _context.UserPreferences
            .FirstOrDefaultAsync(p => p.UserId == userId, cancellationToken);

        if (prefs == null)
            return;

        var text = ProfileEmbeddingTextBuilder.Build(prefs);
        var vector = await _embeddingService.TryEmbedAsync(text, cancellationToken);
        if (vector == null)
        {
            _logger.LogInformation("Skipped profile embedding sync for user {UserId}", userId);
            return;
        }

        prefs.ProfileEmbedding = vector;
        prefs.ProfileEmbeddingUpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);
        _logger.LogInformation("Updated profile embedding for user {UserId}", userId);
    }
}
