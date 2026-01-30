namespace KnowledgeOS.Backend.Entities.Resources.ConcreteResources;

public class ArticleResource
{
    public string Author { get; set; } = string.Empty;
    public string SiteName { get; set; } = string.Empty; 
    public int EstimatedReadingTimeMinutes { get; set; }
}