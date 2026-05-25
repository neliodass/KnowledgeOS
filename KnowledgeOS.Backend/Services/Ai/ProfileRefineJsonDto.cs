namespace KnowledgeOS.Backend.Services.Ai;

public class ProfileRefineJsonDto
{
    public string? AssistantSummary { get; set; }
    public string? ProfessionalContext { get; set; }
    public string? LearningGoals { get; set; }
    public string? Hobbies { get; set; }
    public string? TopicsToAvoid { get; set; }
    public bool HasChanges { get; set; }
}
