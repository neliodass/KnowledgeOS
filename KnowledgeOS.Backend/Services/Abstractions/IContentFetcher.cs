using KnowledgeOS.Backend.Entities.Resources;

namespace KnowledgeOS.Backend.Services.Abstractions;

public interface IContentFetcher
{
    bool CanHandle(Resource resource);
    Task<string> FetchContentAsync(Resource resource);
}