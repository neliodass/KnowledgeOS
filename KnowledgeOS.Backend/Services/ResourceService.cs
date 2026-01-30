using Hangfire;
using KnowledgeOS.Backend.Data;
using KnowledgeOS.Backend.Entities.Resources;
using KnowledgeOS.Backend.Entities.Resources.ConcreteResources;
using KnowledgeOS.Backend.Services.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace KnowledgeOS.Backend.Services;

public class ResourceService:IResourceService
{
    private readonly AppDbContext _context;
    private readonly IBackgroundJobClient _backgroundJobClient;

    public ResourceService(AppDbContext context,IBackgroundJobClient backgroundJobClient)
    {
        _context = context;
        _backgroundJobClient = backgroundJobClient;
    }

    public async Task<Guid> CreateResourceAsync(string url, string userId)
    {
        var resource = ResourceFactory.Create(url, userId);
        _context.Resources.Add(resource);
        await _context.SaveChangesAsync();
        _backgroundJobClient.Enqueue<IUrlIngestionJob>(job => job.ProcessAsync(resource.Id));
        return resource.Id;
    }
    public async Task<List<Resource>> GetUserResourcesAsync(string userId)
    {
        return await _context.Resources
            .Where(r => r.UserId == userId)
            .ToListAsync();
    }
    
}