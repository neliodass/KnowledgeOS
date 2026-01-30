using System.ComponentModel.DataAnnotations;

namespace KnowledgeOS.Backend.Entities.Resources.ConcreteResources;

public class VideoResource:Resource
{
    [MaxLength(200)]
    public string ChannelName { get; set; } = string.Empty;
    public TimeSpan? Duration { get; set; } 
    public long  ViewCount { get; set; } 
}