using Hangfire;
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
    private readonly AppDbContext _context;
    private readonly IBackgroundJobClient _backgroundJobClient;

    public ResourceService(AppDbContext context, IBackgroundJobClient backgroundJobClient)
    {
        _context = context;
        _backgroundJobClient = backgroundJobClient;
    }

    public async Task<Guid> CreateResourceAsync(CreateResourceDto dto, string userId)
    {
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
            .Where(r => r.UserId == userId &&
                        (r.Status == ResourceStatus.Inbox ||
                         r.Status == ResourceStatus.Processing ||
                         r.Status == ResourceStatus.AiAnalysing));
        if (!string.IsNullOrWhiteSpace(search.SearchTerm))
        {
            var term = search.SearchTerm.ToLower();
            query = query.Where(r =>
                r.Title.ToLower().Contains(term) || r.Tags.Any(t => t.Name.ToLower().Contains(term)));
        }

        var totalItems = await query.CountAsync();

        var resources = await query
            .OrderByDescending(r => r.CreatedAt)
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
            .Where(r => r.UserId == userId && r.Status == ResourceStatus.Vault);

        if (filter.CategoryId.HasValue) query = query.Where(r => r.VaultMeta != null && r.VaultMeta.CategoryId == filter.CategoryId.Value);

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

        return dto;
    }

    private InboxResourceDto MapToInboxDto(Resource r)
    {
        var dto = new InboxResourceDto();
        PopulateBaseDto(r, dto);

        dto.CorrectedTitle = r.CorrectedTitle;
        dto.AiSummary = r.InboxMeta?.AiSummary;
        dto.AiScore = r.InboxMeta?.AiScore;
        dto.AiVerdict = r.InboxMeta?.AiVerdict;

        return dto;
    }

    public async Task<List<VaultResourceDto>> GetVaultMixAsync(string userId)
    {
        //random for now TODO - better algorithm
        var resources = await _context.Resources
            .Include(r => r.VaultMeta)
                .ThenInclude(v => v!.Category)
            .Include(r => r.Tags)
            .Where(r => r.UserId == userId && r.Status == ResourceStatus.Vault)
            .OrderBy(r => Guid.NewGuid())
            .Take(3)
            .ToListAsync();

        return resources.Select(MapToVaultDto).ToList();
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
        var baseQuery = _context.Resources
            .Include(r => r.Tags)
            .Include(r => r.InboxMeta)
            .Where(r => r.UserId == userId && r.Status == ResourceStatus.Inbox);

        // 3 items with high, mid, low relevancy

        var high = await baseQuery
            .Where(r => r.InboxMeta != null && r.InboxMeta.AiScore >= 75)
            .OrderBy(r => Guid.NewGuid())
            .Take(1)
            .ToListAsync();

        var mid = await baseQuery
            .Where(r => r.InboxMeta != null && r.InboxMeta.AiScore >= 40 && r.InboxMeta.AiScore < 75)
            .OrderBy(r => Guid.NewGuid())
            .Take(1)
            .ToListAsync();

        var low = await baseQuery
            .Where(r => r.InboxMeta == null || r.InboxMeta.AiScore < 40)
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

        return mixedList.Select(MapToInboxDto).ToList();
    }

    public async Task<InboxResourceDto?> GetInboxResourceByIdAsync(Guid id, string userId)
    {
        var resource = await _context.Resources
            .Include(r => r.Tags)
            .Include(r => r.InboxMeta)
            .FirstOrDefaultAsync(r => r.Id == id && r.UserId == userId);

        if (resource == null) return null;

        if (resource.Status == ResourceStatus.Vault) return null;

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

        if (resource.Status == ResourceStatus.Inbox) return null;

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