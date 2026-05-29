using System.ComponentModel.DataAnnotations;

namespace KnowledgeOS.Backend.DTOs.Feedback;

public class ScoringFeedbackRequestDto
{
    [Required]
    [MaxLength(2000)]
    public string Comment { get; set; } = string.Empty;
}
