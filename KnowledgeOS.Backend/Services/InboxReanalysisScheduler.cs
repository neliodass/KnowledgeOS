using Hangfire;
using KnowledgeOS.Backend.Data;
using KnowledgeOS.Backend.Entities.Resources;
using KnowledgeOS.Backend.Jobs.Abstractions;
using KnowledgeOS.Backend.Services.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace KnowledgeOS.Backend.Services;

public class InboxReanalysisScheduler : IInboxReanalysisScheduler
{
    private readonly AppDbContext _context;
    private readonly IBackgroundJobClient _backgroundJobClient;
    private readonly ILogger<InboxReanalysisScheduler> _logger;

    public InboxReanalysisScheduler(
        AppDbContext context,
        IBackgroundJobClient backgroundJobClient,
        ILogger<InboxReanalysisScheduler> logger)
    {
        _context = context;
        _backgroundJobClient = backgroundJobClient;
        _logger = logger;
    }

    public async Task ScheduleForUserAsync(string userId, int maxItems = 20)
    {
        var resourceIds = await _context.Resources
            .Where(r => r.UserId == userId && r.Status == ResourceStatus.Inbox)
            .OrderByDescending(r => r.CreatedAt)
            .Take(maxItems)
            .Select(r => r.Id)
            .ToListAsync();

        foreach (var id in resourceIds)
            _backgroundJobClient.Enqueue<IAiAnalysisJob>(job => job.ProcessAsync(id));

        if (resourceIds.Count > 0)
            _logger.LogInformation("Scheduled inbox re-analysis for {Count} resources (user {UserId})",
                resourceIds.Count, userId);
    }
}
