using KnowledgeOS.Backend.DTOs.Common;
using KnowledgeOS.Backend.DTOs.Resources;
using KnowledgeOS.Backend.Entities.Resources;

namespace KnowledgeOS.Backend.Services.Abstractions;

public interface IResourceService
{
    Task<Guid> CreateResourceAsync(string url, string userId);

    Task<PagedResult<ResourceDto>> GetUserResourcesAsync(string userId, PaginationQuery pagination,
        ResourceStatus? status = null);

    Task UpdateResourceStatusAsync(Guid id, string userId, ResourceStatus newStatus);
    Task<List<ResourceDto>> GetSmartMixAsync(string userId);
    Task<ResourceDto?> GetResourceByIdAsync(Guid id, string userId);
    Task DeleteResourceAsync(Guid id, string userId);
    Task RetryProcessingAsync(Guid id, string userId);
    Task AssignCategoryAsync(Guid resourceId, string userId, Guid? categoryId);
}