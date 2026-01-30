namespace KnowledgeOS.Backend.Entities.Resources.ConcreteResources;

public class VideoResource:Resource
{
    public string ChannelName { get; set; } = string.Empty;
    public TimeSpan? Duration { get; set; } 
    public int ViewCount { get; set; } 
}