namespace KnowledgeOS.Backend.DTOs.Feedback;

public class ScoringFeedbackResponseDto
{
    public Guid Id { get; set; }
    public Guid ResourceId { get; set; }
    public string Comment { get; set; } = string.Empty;
    public int? AiScoreAtFeedback { get; set; }
    public DateTime CreatedAt { get; set; }
}
