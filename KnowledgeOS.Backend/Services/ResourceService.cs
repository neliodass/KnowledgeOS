using Hangfire;
using KnowledgeOS.Backend.Data;
using KnowledgeOS.Backend.DTOs.Resources;
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
    public async Task<List<ResourceDto>> GetUserResourcesAsync(string userId, ResourceStatus? status = null)
    {
        var query = _context.Resources
            .Include(r => r.Tags) 
            .Where(r => r.UserId == userId);

        if (status.HasValue)
        {
            query = query.Where(r => r.Status == status.Value);
        }
        else
        {
            query = query.Where(r => r.Status != ResourceStatus.Trash && r.Status != ResourceStatus.Archived);
        }

        var resources = await query
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        return resources.Select(MapToDto).ToList();
    }

    private ResourceDto MapToDto(Resource r)
    {
        var dto = new ResourceDto
        {
            Id = r.Id,
            Url = r.Url,
            Title = r.Title,
            CorrectedTitle = r.CorrectedTitle ?? "",
            ImageUrl = r.ImageUrl,
            Status = r.Status.ToString(),
            CreatedAt = r.CreatedAt,
            
            AiScore = r.AiScore,
            AiVerdict = r.AiVerdict,
            AiSummary = r.AiSummary,
            
            Tags = r.Tags.Select(t => t.Name).ToList()
        };
        
        if (r is VideoResource v)
        {
            dto.ResourceType = "Video";
            dto.ChannelName = v.ChannelName;
            dto.Duration = v.Duration?.ToString(@"hh\:mm\:ss"); 
            dto.ViewCount = v.ViewCount;
        }
        else if (r is ArticleResource a)
        {
            dto.ResourceType = "Article";
            dto.SiteName = a.SiteName;
            dto.Author = a.Author;
        }
        else
        {
            dto.ResourceType = "Unknown";
        }

        return dto;
    }
    
}