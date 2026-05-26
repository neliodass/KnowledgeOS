namespace KnowledgeOS.Backend.DTOs.Resources;

public class InboxResourceDto : ResourceBaseDto
{
    public string? CorrectedTitle { get; set; }
    public string? AiSummary { get; set; }
    public string? AiVerdict { get; set; }

    public string? SubstanceDepth { get; set; }
    public string? ContentIntent { get; set; }
    public string? Relevance { get; set; }
    public string? Takeaway { get; set; }
    public bool ScoredFromMetadataOnly { get; set; }
}
