namespace KnowledgeOS.Backend.Services.Ai.Scoring;

public record InboxAnalysisTiers(
    IntrinsicQualityTier IntrinsicQuality,
    RelevanceTier Relevance,
    bool MatchesAvoidance,
    bool ScoredFromMetadataOnly
);
