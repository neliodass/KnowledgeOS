using KnowledgeOS.Backend.Entities.Resources;

namespace KnowledgeOS.Backend.Services.Abstractions;

public interface IResourceService
{
    Task<Guid> CreateResourceAsync(string url,string userId);
    Task<List<Resource>> GetUserResourcesAsync(string userId);
}