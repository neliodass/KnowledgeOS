using Hangfire;
using KnowledgeOS.Backend.Data;
using KnowledgeOS.Backend.Entities.Resources;
using KnowledgeOS.Backend.Jobs.Abstractions;
using KnowledgeOS.Backend.Services.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace KnowledgeOS.Backend.Jobs;

public class ErrorRecoveryJob : IErrorRecoveryJob
{
    private readonly AppDbContext _context;
    private readonly IBackgroundJobClient _backgroundJobClient;
    private readonly ILogger<ErrorRecoveryJob> _logger;

    public ErrorRecoveryJob(
        AppDbContext context, 
        IBackgroundJobClient backgroundJobClient,
        ILogger<ErrorRecoveryJob> logger)
    {
        _context = context;
        _backgroundJobClient = backgroundJobClient;
        _logger = logger;
    }

    public async Task RecoverAsync()
    {
        var failedResources = await _context.Resources.IgnoreQueryFilters()
            .Where(r => r.Status == ResourceStatus.Error)
            .ToListAsync();

        if (!failedResources.Any()) return;

        _logger.LogInformation($"Found {failedResources.Count} failed resources. Attempting recovery...");

        foreach (var resource in failedResources)
        {
            resource.Status = ResourceStatus.Processing;
            
            _backgroundJobClient.Enqueue<IUrlIngestionJob>(job => job.ProcessAsync(resource.Id));
        }

        await _context.SaveChangesAsync();
    }
}