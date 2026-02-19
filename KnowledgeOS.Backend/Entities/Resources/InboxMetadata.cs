using System.ComponentModel.DataAnnotations;

namespace KnowledgeOS.Backend.Entities.Resources;

public class InboxMetadata
{
    [Key]
    public Guid ResourceId { get; set; }
    public Resource Resource { get; set; } = null!;

    public int AiScore { get; set; }
    [MaxLength(500)] public string AiVerdict { get; set; } = string.Empty;
    public string AiSummary { get; set; } = string.Empty;
}
