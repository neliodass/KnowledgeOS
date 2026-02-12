using System.ComponentModel.DataAnnotations;
using KnowledgeOS.Backend.Entities.Tagging;

namespace KnowledgeOS.Backend.Entities.Resources;

public class VaultMetadata
{
    [Key]
    public Guid ResourceId { get; set; }
    public Resource Resource { get; set; } = null!;

    public string AiSummary { get; set; } = string.Empty;

    [MaxLength(100)] public string? SuggestedCategoryName { get; set; }

    public Guid? CategoryId { get; set; }
    public Category? Category { get; set; }

    public string? UserNote { get; set; }
    public DateTime? PromotedToVaultAt { get; set; }
}

