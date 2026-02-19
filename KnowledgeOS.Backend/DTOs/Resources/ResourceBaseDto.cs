namespace KnowledgeOS.Backend.DTOs.Resources;

public abstract class ResourceBaseDto
{
    public Guid Id { get; set; }
    public string Url { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public string ResourceType { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }

    // Common Ai properties
    public string? AiSummary { get; set; }
    public List<string> Tags { get; set; } = new();

    // TODO - exclude from base dto?
    public string? ChannelName { get; set; } // Video
    public string? Duration { get; set; } // Video
    public long? ViewCount { get; set; } // Video
    public string? SiteName { get; set; } // Article
    public string? Author { get; set; } // Article
    public int? EstimatedReadingTimeMinutes { get; set; } // Article
}