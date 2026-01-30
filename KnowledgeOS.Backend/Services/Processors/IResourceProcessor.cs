using KnowledgeOS.Backend.Entities.Resources;

namespace KnowledgeOS.Backend.Services.Processors;

public interface IResourceProcessor
{
    bool CanHandle(Resource resource);
    Task ProcessAsync(Resource resource);
}