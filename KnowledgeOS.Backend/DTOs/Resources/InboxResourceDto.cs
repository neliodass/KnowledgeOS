namespace KnowledgeOS.Backend.DTOs.Resources;

public class InboxResourceDto : ResourceBaseDto
{
    public int? AiScore { get; set; }
    public string? AiVerdict { get; set; }
    public string? CorrectedTitle { get; set; }
}