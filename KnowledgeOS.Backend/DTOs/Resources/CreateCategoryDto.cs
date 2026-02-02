using System.ComponentModel.DataAnnotations;

namespace KnowledgeOS.Backend.DTOs.Resources;

public class CreateCategoryDto
{
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;
}