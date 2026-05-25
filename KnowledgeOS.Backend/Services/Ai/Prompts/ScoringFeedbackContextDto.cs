namespace KnowledgeOS.Backend.Services.Ai.Prompts;

public record ScoringFeedbackContextDto(
    string Title,
    string Url,
    int? AiScore,
    string? AiVerdict,
    string UserComment
);
