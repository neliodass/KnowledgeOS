using System.ComponentModel.DataAnnotations;

namespace KnowledgeOS.Backend.DTOs.Resources;

public class CreateResourceDto
{
    [Required]
    [Url]
    public string Url { get; set; } = string.Empty;
}