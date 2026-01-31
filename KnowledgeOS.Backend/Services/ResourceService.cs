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
    public async Task UpdateResourceStatusAsync(Guid id, string userId, ResourceStatus newStatus)
    {
        var resource = await _context.Resources
            .FirstOrDefaultAsync(r => r.Id == id && r.UserId == userId);

        if (resource == null)
        {
            throw new KeyNotFoundException("Resource not found");
        }
        
        resource.Status = newStatus;

        if (newStatus == ResourceStatus.Vault && resource.PromotedToVaultAt == null)
        {
            resource.PromotedToVaultAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
    }

    public async Task<List<ResourceDto>> GetSmartMixAsync(string userId)
    {
      
        var baseQuery = _context.Resources
            .Include(r => r.Tags)
            .Where(r => r.UserId == userId && r.Status == ResourceStatus.Inbox);
        
        // 3 items with high, mid, low relevancy
        
        var high = await baseQuery
            .Where(r => r.AiScore >= 75)
            .OrderBy(r => Guid.NewGuid()) 
            .Take(1)
            .ToListAsync();
        
        var mid = await baseQuery
            .Where(r => r.AiScore >= 40 && r.AiScore < 75)
            .OrderBy(r => Guid.NewGuid())
            .Take(1)
            .ToListAsync();
        
        var low = await baseQuery
            .Where(r => r.AiScore < 40 || r.AiScore == null)
            .OrderBy(r => Guid.NewGuid())
            .Take(1)
            .ToListAsync();
        
        var mixedList = high.Concat(mid).Concat(low).ToList();

        // Fallback if cant find 3 items with diffrent relevancy
        if (mixedList.Count < 3)
        {
            var existingIds = mixedList.Select(x => x.Id).ToList();
            var filler = await baseQuery
                .Where(r => !existingIds.Contains(r.Id))
                .OrderBy(r => Guid.NewGuid())
                .Take(3 - mixedList.Count)
                .ToListAsync();
            mixedList.AddRange(filler);
        }

        return mixedList.Select(MapToDto).ToList();
    }
    
}