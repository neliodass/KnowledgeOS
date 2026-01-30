using System.ComponentModel.DataAnnotations;

namespace KnowledgeOS.Backend.Entities.Resources.ConcreteResources;

public class ArticleResource:Resource
{
    [MaxLength(200)]
    public string Author { get; set; } = string.Empty;
    [MaxLength(200)]
    public string SiteName { get; set; } = string.Empty; 
    public int EstimatedReadingTimeMinutes { get; set; }
}