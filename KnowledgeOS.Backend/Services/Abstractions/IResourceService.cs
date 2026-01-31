using KnowledgeOS.Backend.DTOs.Resources;
using KnowledgeOS.Backend.Entities.Resources;

namespace KnowledgeOS.Backend.Services.Abstractions;

public interface IResourceService
{
    Task<Guid> CreateResourceAsync(string url,string userId);
    Task<List<ResourceDto>> GetUserResourcesAsync(string userId,ResourceStatus? status = null);
    Task UpdateResourceStatusAsync(Guid id, string userId, ResourceStatus newStatus);
    Task<List<ResourceDto>> GetSmartMixAsync(string userId);
}