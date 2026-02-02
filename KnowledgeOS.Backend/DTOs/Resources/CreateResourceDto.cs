using System.ComponentModel.DataAnnotations;

namespace KnowledgeOS.Backend.DTOs.Resources;

public class CreateResourceDto
{
    [Required] [Url] public string Url { get; set; } = string.Empty;
    public bool AddToVault { get; set; } = false;
    public Guid? CategoryId { get; set; }
}