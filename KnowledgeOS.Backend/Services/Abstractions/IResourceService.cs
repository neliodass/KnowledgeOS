using KnowledgeOS.Backend.DTOs.Common;
using KnowledgeOS.Backend.DTOs.Resources;
using KnowledgeOS.Backend.Entities.Resources;

namespace KnowledgeOS.Backend.Services.Abstractions;

public interface IResourceService
{
    Task<Guid> CreateResourceAsync(CreateResourceDto dto, string userId); 
    
    Task<PagedResult<InboxResourceDto>> GetInboxResourcesAsync(string userId, PaginationQuery pagination, ResourceStatus? status = null);
    Task<PagedResult<VaultResourceDto>> GetVaultResourcesAsync(string userId, PaginationQuery pagination);
    Task<List<VaultResourceDto>> GetVaultMixAsync(string userId);
    Task<List<InboxResourceDto>> GetSmartMixAsync(string userId);

    Task UpdateResourceStatusAsync(Guid id, string userId, ResourceStatus newStatus);
    Task<InboxResourceDto?> GetInboxResourceByIdAsync(Guid id, string userId);
    Task<VaultResourceDto?> GetVaultResourceByIdAsync(Guid id, string userId);
    Task DeleteResourceAsync(Guid id, string userId);
    Task RetryProcessingAsync(Guid id, string userId);
    Task AssignCategoryAsync(Guid resourceId, string userId, Guid? categoryId);
}