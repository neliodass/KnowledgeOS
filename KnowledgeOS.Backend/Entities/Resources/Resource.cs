using System.ComponentModel.DataAnnotations;

namespace KnowledgeOS.Backend.Entities.Resources;

public abstract class Resource
{
    [Key]
    public Guid Id { get; set; }

    [Required]
    [MaxLength(2048)]
    public string Url { get; set; } = string.Empty;
    [MaxLength(500)]
    public string Title { get; set; } = "Waiting for analysis...";
    [MaxLength(500)]
    public string? CorrectedTitle { get; set; }
    [MaxLength(2000)]
    public string? Description { get; set; }
    [MaxLength(2048)]
    public string? ImageUrl { get; set; }

    public ResourceStatus Status { get; set; } = ResourceStatus.New;

    
    public int? AiScore { get; set; }
    [MaxLength(500)]
    public string? AiVerdict { get; set; }
    public string? AiSummary { get; set; }
    
    public string? UserNote { get; set; }
    [MaxLength(100)]
    public string? Category { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? PromotedToVaultAt { get; set; }
}