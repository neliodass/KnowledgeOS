using System.ComponentModel.DataAnnotations;

namespace KnowledgeOS.Backend.Entities.Resources;

public class InboxMetadata
{
    [Key]
    public Guid ResourceId { get; set; }
    public Resource Resource { get; set; } = null!;

    [MaxLength(30)]
    public string? SubstanceDepth { get; set; }

    [MaxLength(30)]
    public string? ContentIntent { get; set; }

    [MaxLength(30)]
    public string? Relevance { get; set; }

    [MaxLength(120)]
    public string? Takeaway { get; set; }

    public int SortPriority { get; set; }

    public bool MatchesAvoidance { get; set; }

    public bool ScoredFromMetadataOnly { get; set; }

    /// <summary>Deprecated — kept for legacy rows; new analyses do not set this.</summary>
    public int? AiScore { get; set; }

    [MaxLength(500)]
    public string AiVerdict { get; set; } = string.Empty;

    public string AiSummary { get; set; } = string.Empty;
}
