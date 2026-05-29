using Hangfire;
using KnowledgeOS.Backend.Jobs.Abstractions;
using KnowledgeOS.Backend.Data;
using KnowledgeOS.Backend.DTOs.Common;
using KnowledgeOS.Backend.DTOs.Resources;
using KnowledgeOS.Backend.Entities.Resources;
using KnowledgeOS.Backend.Entities.Resources.ConcreteResources;
using KnowledgeOS.Backend.Services.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace KnowledgeOS.Backend.Services;

public class ResourceService : IResourceService
{
    private static readonly ResourceStatus[] InboxPipelineStatuses =
    [
        ResourceStatus.New,
        ResourceStatus.Processing,
        ResourceStatus.AiAnalysing,
        ResourceStatus.Inbox
    ];

    private readonly AppDbContext _context;
    private readonly IBackgroundJobClient _backgroundJobClient;

    public ResourceService(AppDbContext context, IBackgroundJobClient backgroundJobClient)
    {
        _context = context;
        _backgroundJobClient = backgroundJobClient;
    }

    public async Task<Guid> CreateResourceAsync(CreateResourceDto dto, string userId)
    {
        var existingResource = await _context.Resources
            .Include(r => r.VaultMeta)
            .FirstOrDefaultAsync(r => r.Url == dto.Url && r.UserId == userId);

        if (existingResource != null)
        {
            if (existingResource.Status == ResourceStatus.Trash)
            {
                existingResource.Status = ResourceStatus.Processing;
            }

            await RetryProcessingAsync(existingResource.Id, userId);
            if (dto.AddToVault)
            {
                if (!existingResource.IsVaultTarget)
                {
                    existingResource.IsVaultTarget = true;
                }
                if (existingResource.VaultMeta == null)
                {
                    existingResource.VaultMeta = new VaultMetadata
                    {
                        CategoryId = dto.CategoryId,
                        PromotedToVaultAt = DateTime.UtcNow
                    };
                    await _context.SaveChangesAsync(); 
                }
            }

            return existingResource.Id;
        }
        var resource = ResourceFactory.Create(dto.Url, userId);
        if (dto.AddToVault)
        {
            resource.IsVaultTarget = true;
            resource.VaultMeta = new VaultMetadata
            {
                CategoryId = dto.CategoryId,
                PromotedToVaultAt = DateTime.UtcNow
            };
        }

        _context.Resources.Add(resource);
        await _context.SaveChangesAsync();
        _backgroundJobClient.Enqueue<IUrlIngestionJob>(job => job.ProcessAsync(resource.Id));
        return resource.Id;
    }

    public async Task<PagedResult<InboxResourceDto>> GetInboxResourcesAsync(string userId, PaginationQuery pagination,
        SearchQuery search)
    {
        var query = _context.Resources
            .Include(r => r.Tags)
            .Include(r => r.InboxMeta)
            .Where(r => r.UserId == userId
                        && !r.IsVaultTarget
                        && InboxPipelineStatuses.Contains(r.Status));
        if (!string.IsNullOrWhiteSpace(search.SearchTerm))
        {
            var term = search.SearchTerm.ToLower();
            query = query.Where(r =>
                r.Title.ToLower().Contains(term) || r.Tags.Any(t => t.Name.ToLower().Contains(term)));
        }

        var totalItems = await query.CountAsync();

        var resources = await query
            .OrderByDescending(r => r.InboxMeta != null ? r.InboxMeta.SortPriority : 0)
            .ThenByDescending(r => r.CreatedAt)
            .Skip((pagination.PageNumber - 1) * pagination.PageSize)
            .Take(pagination.PageSize)
            .ToListAsync();

        var dtos = resources.Select(MapToInboxDto).ToList();
        return new PagedResult<InboxResourceDto>(dtos, totalItems, pagination.PageNumber, pagination.PageSize);
    }

    public async Task<PagedResult<VaultResourceDto>> GetVaultResourcesAsync(string userId, PaginationQuery pagination,
        SearchQuery search, VaultFilter filter)
    {
        var query = _context.Resources
            .Include(r => r.Tags)
            .Include(r => r.VaultMeta)
                .ThenInclude(v => v!.Category)
            .Where(r => r.UserId == userId
                        && r.IsVaultTarget
                        && r.Status != ResourceStatus.Trash
                        && r.Status != ResourceStatus.Archived);

        if (filter.UncategorizedOnly)
        {
            query = query.Where(r => r.VaultMeta == null || r.VaultMeta.CategoryId == null);
        }
        else if (filter.CategoryId.HasValue)
        {
            query = query.Where(r => r.VaultMeta != null && r.VaultMeta.CategoryId == filter.CategoryId.Value);
        }

        if (!string.IsNullOrWhiteSpace(search.SearchTerm))
        {
            var term = search.SearchTerm.ToLower();
            query = query.Where(r =>
                r.Title.ToLower().Contains(term) || r.Tags.Any(t => t.Name.ToLower().Contains(term)));
        }

        var totalItems = await query.CountAsync();
        var resources = await query
            .OrderByDescending(r => r.VaultMeta != null ? r.VaultMeta.PromotedToVaultAt : r.CreatedAt)
            .Skip((pagination.PageNumber - 1) * pagination.PageSize)
            .Take(pagination.PageSize)
            .ToListAsync();

        var dtos = resources.Select(MapToVaultDto).ToList();

        return new PagedResult<VaultResourceDto>(dtos, totalItems, pagination.PageNumber, pagination.PageSize);
    }

    private void PopulateBaseDto(Resource r, ResourceBaseDto dto)
    {
        dto.Id = r.Id;
        dto.Url = r.Url;
        dto.Title = r.Title;
        dto.ImageUrl = r.ImageUrl;
        dto.CreatedAt = r.CreatedAt;
        dto.Tags = r.Tags.Select(t => t.Name).ToList();

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
            dto.EstimatedReadingTimeMinutes = a.EstimatedReadingTimeMinutes;
        }
        else
        {
            dto.ResourceType = "Unknown";
        }
    }

    private VaultResourceDto MapToVaultDto(Resource r)
    {
        var dto = new VaultResourceDto();
        PopulateBaseDto(r, dto);

        dto.AiSummary = r.VaultMeta?.AiSummary;
        dto.CategoryId = r.VaultMeta?.CategoryId;
        dto.CategoryName = r.VaultMeta?.Category?.Name;
        dto.SuggestedCategoryName = r.VaultMeta?.SuggestedCategoryName;
        dto.UserNote = r.VaultMeta?.UserNote;
        dto.PromotedToVaultAt = r.VaultMeta?.PromotedToVaultAt;
        dto.Status = r.Status.ToString();

        return dto;
    }

    private InboxResourceDto MapToInboxDto(Resource r)
    {
        var dto = new InboxResourceDto();
        PopulateBaseDto(r, dto);

        dto.CorrectedTitle = r.CorrectedTitle;
        dto.AiSummary = r.InboxMeta?.AiSummary;
        dto.AiVerdict = r.InboxMeta?.AiVerdict;
        dto.SubstanceDepth = r.InboxMeta?.SubstanceDepth;
        dto.ContentIntent = r.InboxMeta?.ContentIntent;
        dto.Relevance = r.InboxMeta?.Relevance;
        dto.Takeaway = r.InboxMeta?.Takeaway;
        dto.ScoredFromMetadataOnly = r.InboxMeta?.ScoredFromMetadataOnly ?? false;

        return dto;
    }

    public async Task<List<VaultResourceDto>> GetVaultMixAsync(string userId)
    {
        // diffrent categories for now TODO - better algorithm
        var randomPool = await _context.Resources
            .Include(r => r.VaultMeta)
            .ThenInclude(v => v!.Category)
            .Include(r => r.Tags)
            .Where(r => r.UserId == userId
                        && r.IsVaultTarget
                        && r.Status != ResourceStatus.Trash
                        && r.Status != ResourceStatus.Archived)
            .OrderBy(r => Guid.NewGuid())
            .Take(15)
            .ToListAsync();

        if (!randomPool.Any())
        {
            return new List<VaultResourceDto>();
        }

      //select 3 items from diffrent categories (if possible)
        var selectedResources = randomPool
            .GroupBy(r => r.VaultMeta?.Category?.Id) 
            .Select(group => group.First())
            .Take(3)
            .ToList();

        //if not possible to select 3 diffrent categories, fill the rest with random items from pool
        if (selectedResources.Count < 3)
        {
            var neededItems = 3 - selectedResources.Count;
            var fallbackItems = randomPool
                .Except(selectedResources) //exclude already selected items
                .Take(neededItems);

            selectedResources.AddRange(fallbackItems);
        }
        return selectedResources.Select(MapToVaultDto).ToList();
    }


    public async Task UpdateResourceStatusAsync(Guid id, string userId, ResourceStatus newStatus)
    {
        var resource = await _context.Resources
            .Include(r => r.VaultMeta)
            .FirstOrDefaultAsync(r => r.Id == id && r.UserId == userId);

        if (resource == null) throw new KeyNotFoundException("Resource not found");

        resource.Status = newStatus;

        if (newStatus == ResourceStatus.Vault)
        {
            if (resource.VaultMeta == null)
            {
                resource.VaultMeta = new VaultMetadata
                {
                    PromotedToVaultAt = DateTime.UtcNow
                };
            }
            else if (resource.VaultMeta.PromotedToVaultAt == null)
            {
                resource.VaultMeta.PromotedToVaultAt = DateTime.UtcNow;
            }
        }

        await _context.SaveChangesAsync();
    }

    public async Task<List<InboxResourceDto>> GetSmartMixAsync(string userId)
    {
        const int mixSize = 3;
        const int poolSize = 15;

        // Dashboard preview: only analysed inbox items (not pipeline / vault-target).
        var randomPool = await _context.Resources
            .Include(r => r.Tags)
            .Include(r => r.InboxMeta)
            .Where(r => r.UserId == userId
                        && !r.IsVaultTarget
                        && r.Status == ResourceStatus.Inbox)
            .OrderBy(r => Guid.NewGuid())
            .Take(poolSize)
            .ToListAsync();

        if (!randomPool.Any())
            return new List<InboxResourceDto>();

        // Prefer one item per content character (learn, entertain, news, inspire, mixed).
        var selected = randomPool
            .Where(r => !string.IsNullOrWhiteSpace(r.InboxMeta?.ContentIntent))
            .GroupBy(r => r.InboxMeta!.ContentIntent!)
            .OrderBy(_ => Guid.NewGuid())
            .Select(g => g.First())
            .Take(mixSize)
            .ToList();

        if (selected.Count < mixSize)
        {
            var selectedIds = selected.Select(r => r.Id).ToHashSet();
            var filler = randomPool
                .Where(r => !selectedIds.Contains(r.Id))
                .Take(mixSize - selected.Count);
            selected.AddRange(filler);
        }

        return selected.Select(MapToInboxDto).ToList();
    }

    public async Task<InboxResourceDto?> GetInboxResourceByIdAsync(Guid id, string userId)
    {
        var resource = await _context.Resources
            .Include(r => r.Tags)
            .Include(r => r.InboxMeta)
            .FirstOrDefaultAsync(r => r.Id == id && r.UserId == userId);

        if (resource == null) return null;

        if (resource.IsVaultTarget || resource.Status == ResourceStatus.Vault) return null;

        return MapToInboxDto(resource);
    }

    public async Task<VaultResourceDto?> GetVaultResourceByIdAsync(Guid id, string userId)
    {
        var resource = await _context.Resources
            .Include(r => r.Tags)
            .Include(r => r.VaultMeta)
                .ThenInclude(v => v!.Category)
            .FirstOrDefaultAsync(r => r.Id == id && r.UserId == userId);

        if (resource == null) return null;

        if (!resource.IsVaultTarget
            || resource.Status == ResourceStatus.Trash
            || resource.Status == ResourceStatus.Archived)
            return null;

        return MapToVaultDto(resource);
    }

    public async Task DeleteResourceAsync(Guid id, string userId)
    {
        var resource = await _context.Resources
            .FirstOrDefaultAsync(r => r.Id == id && r.UserId == userId);

        if (resource == null) return;
        //Two step deletion: first move to trash, then delete permanently

        if (resource.Status != ResourceStatus.Trash)
            resource.Status = ResourceStatus.Trash;
        else
            _context.Resources.Remove(resource);

        await _context.SaveChangesAsync();
    }

    public async Task RetryProcessingAsync(Guid id, string userId)
    {
        var resource = await _context.Resources
            .Include(r => r.InboxMeta)
            .FirstOrDefaultAsync(r => r.Id == id && r.UserId == userId);

        if (resource == null) throw new KeyNotFoundException();

        resource.Status = ResourceStatus.Processing;

        if (resource.InboxMeta != null)
        {
            _context.InboxMetadata.Remove(resource.InboxMeta);
            resource.InboxMeta = null;
        }

        await _context.SaveChangesAsync();

        _backgroundJobClient.Enqueue<IUrlIngestionJob>(job => job.ProcessAsync(resource.Id));
    }

    public async Task PromoteToVaultAsync(Guid id, string userId)
    {
        var resource = await _context.Resources
            .Include(r => r.InboxMeta)
            .Include(r => r.VaultMeta)
            .FirstOrDefaultAsync(r => r.Id == id && r.UserId == userId);

        if (resource == null) throw new KeyNotFoundException("Resource not found");

        resource.IsVaultTarget = true;

        if (resource.VaultMeta == null)
        {
            resource.VaultMeta = new VaultMetadata
            {
                ResourceId = resource.Id,
                PromotedToVaultAt = DateTime.UtcNow
            };
        }
        else if (resource.VaultMeta.PromotedToVaultAt == null)
        {
            resource.VaultMeta.PromotedToVaultAt = DateTime.UtcNow;
        }

        resource.Status = ResourceStatus.AiAnalysing;
        await _context.SaveChangesAsync();

        _backgroundJobClient.Enqueue<IAiAnalysisJob>(job => job.ProcessAsync(resource.Id));
    }

    public async Task AssignCategoryAsync(Guid resourceId, string userId, Guid? categoryId)
    {
        var resource = await _context.Resources
            .Include(r => r.VaultMeta)
            .FirstOrDefaultAsync(r => r.Id == resourceId && r.UserId == userId);

        if (resource == null) throw new KeyNotFoundException("Resource not found");

        if (categoryId.HasValue)
        {
            var categoryExists = await _context.Categories
                .AnyAsync(c => c.Id == categoryId.Value && c.UserId == userId);

            if (!categoryExists) throw new KeyNotFoundException("Category not found");
        }

        if (resource.VaultMeta == null)
        {
            resource.VaultMeta = new VaultMetadata
            {
                ResourceId = resource.Id,
                CategoryId = categoryId
            };
        }
        else
        {
            resource.VaultMeta.CategoryId = categoryId;
            resource.VaultMeta.SuggestedCategoryName = null;
        }

        await _context.SaveChangesAsync();
    }
}