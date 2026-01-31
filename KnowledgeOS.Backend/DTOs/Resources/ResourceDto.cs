namespace KnowledgeOS.Backend.DTOs.Resources;

public class ResourceDto
{
    public Guid Id { get; set; }
    public string Url { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }

    public string Status { get; set; } = string.Empty;
    public string ResourceType { get; set; } = string.Empty;

    public int? AiScore { get; set; }
    public string? AiVerdict { get; set; }
    public string? AiSummary { get; set; }
    public List<string> Tags { get; set; } = new();

    public DateTime CreatedAt { get; set; }

    //Specific for VideoResource
    public string? ChannelName { get; set; }
    public string? Duration { get; set; }

    public long? ViewCount { get; set; }

    //Specific for ArticleResource
    public string? SiteName { get; set; }
    public string? Author { get; set; }
}