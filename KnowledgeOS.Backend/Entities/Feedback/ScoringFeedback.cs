using System.ComponentModel.DataAnnotations;
using KnowledgeOS.Backend.Entities.Abstractions;
using KnowledgeOS.Backend.Entities.Resources;
using KnowledgeOS.Backend.Entities.Users;

namespace KnowledgeOS.Backend.Entities.Feedback;

public class ScoringFeedback : IUserOwnedResource
{
    [Key] public Guid Id { get; set; }

    [Required] public string UserId { get; set; } = string.Empty;
    public ApplicationUser? User { get; set; }

    [Required] public Guid ResourceId { get; set; }
    public Resource? Resource { get; set; }

    [Required]
    [MaxLength(2000)]
    public string Comment { get; set; } = string.Empty;

    public int? AiScoreAtFeedback { get; set; }

    [MaxLength(500)]
    public string? AiVerdictAtFeedback { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
