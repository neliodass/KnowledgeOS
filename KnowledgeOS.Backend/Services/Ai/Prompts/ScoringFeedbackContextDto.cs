namespace KnowledgeOS.Backend.Services.Ai.Prompts;

public record ScoringFeedbackContextDto(
    string Title,
    string Url,
    string? SubstanceDepth,
    string? ContentIntent,
    string? Relevance,
    string? Takeaway,
    int SortPriority,
    string? AiVerdict,
    string UserComment
);
