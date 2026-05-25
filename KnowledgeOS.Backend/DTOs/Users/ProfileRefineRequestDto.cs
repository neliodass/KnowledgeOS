using System.ComponentModel.DataAnnotations;

namespace KnowledgeOS.Backend.DTOs.Users;

public class ProfileRefineRequestDto
{
    [Required]
    [MaxLength(2000)]
    public string Message { get; set; } = string.Empty;

    public Guid? ResourceId { get; set; }
}
