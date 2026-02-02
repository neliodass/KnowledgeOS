namespace KnowledgeOS.Backend.DTOs.Resources;

public class VaultResourceDto : ResourceBaseDto
{
    public Guid? CategoryId { get; set; }
    public string? CategoryName { get; set; }
    public string? UserNote { get; set; }
    public DateTime? PromotedToVaultAt { get; set; }
}