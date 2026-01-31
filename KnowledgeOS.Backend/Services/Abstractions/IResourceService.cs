using KnowledgeOS.Backend.DTOs.Common;
using KnowledgeOS.Backend.DTOs.Resources;
using KnowledgeOS.Backend.Entities.Resources;

namespace KnowledgeOS.Backend.Services.Abstractions;

public interface IResourceService
{
    Task<Guid> CreateResourceAsync(string url,string userId);
    Task<PagedResult<ResourceDto>> GetUserResourcesAsync(string userId, PaginationQuery pagination, ResourceStatus? status = null);
    Task UpdateResourceStatusAsync(Guid id, string userId, ResourceStatus newStatus);
    Task<List<ResourceDto>> GetSmartMixAsync(string userId);
}