namespace KnowledgeOS.Backend.DTOs.Resources;

public class VaultResourceDto : ResourceBaseDto
{
    public string Status { get; set; } = string.Empty;
    public Guid? CategoryId { get; set; }
    public string? CategoryName { get; set; }
    public string? SuggestedCategoryName { get; set; }
    public string? UserNote { get; set; }
    public DateTime? PromotedToVaultAt { get; set; }
}