namespace KnowledgeOS.Backend.Services.Ai.Scoring;

public record InboxAnalysisTiers(
    SubstanceDepthTier SubstanceDepth,
    ContentIntentTier ContentIntent,
    RelevanceTier Relevance,
    bool MatchesAvoidance,
    bool ScoredFromMetadataOnly
);
