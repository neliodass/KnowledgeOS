using KnowledgeOS.Backend.Entities.Resources;
using KnowledgeOS.Backend.Entities.Resources.ConcreteResources;

namespace KnowledgeOS.Backend.Services;

public class ResourceFactory
{
    public static Resource Create(string url, string userId)
    {
        if (url.Contains("youtube.com") || url.Contains("youtu.be"))
        {
            return new VideoResource
            {
                Url = url,
                UserId = userId,
                Title = "New Video",
                Status = ResourceStatus.New
            };
        }

        return new ArticleResource
        {
            Url = url,
            UserId = userId,
            Title = "New Article",
            Status = ResourceStatus.New
        };
    }
}