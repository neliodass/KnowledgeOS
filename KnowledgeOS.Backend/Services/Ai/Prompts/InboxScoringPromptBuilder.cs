using System.Text.Json;
using KnowledgeOS.Backend.Entities.Resources;
using KnowledgeOS.Backend.Entities.Resources.ConcreteResources;
using KnowledgeOS.Backend.Entities.Users;
using KnowledgeOS.Backend.Services.Ai.Embeddings;

namespace KnowledgeOS.Backend.Services.Ai.Prompts;

public static class InboxScoringPromptBuilder
{
    public static (string SystemPrompt, string UserPrompt) Build(
        Resource resource,
        UserPreference? prefs,
        string? contentSnippet,
        EmbeddingRelevanceHint? embeddingHint = null)
    {
        var profile = AiProfileDtoFactory.From(prefs);
        var hasSnippet = !string.IsNullOrWhiteSpace(contentSnippet);

        var systemPrompt = """
            You are a personalized knowledge curator API. Output ONLY valid JSON matching the schema.

            Evaluate three independent axes (do not collapse them into one score):

            1) substanceDepth — craft, effort, and depth of the content itself (NOT user fit, NOT entertainment vs education).
               - deep: substantive expertise, long-form craft, real technique or analysis.
               - moderate: solid but not exceptional depth.
               - shallow: thin, listicle, reaction bait, spectacle without substance.
               - insufficient_data: contentSnippet is null or too thin; judge only from title/description/metadata.

            2) contentIntent — primary character of the piece (entertainment can be high substance; cooking hobby video can be entertain + deep).
               - learn, entertain, inspire, news, mixed

            3) relevance — fit to the user's profile JSON (only when substanceDepth is deep, moderate, or shallow — NOT insufficient_data):
               - professional, hobby, discovery, standard, none (use none when substanceDepth is insufficient_data)

            matchesAvoidance: true only if content clearly matches topicsToAvoid.

            takeaway: ONE short line in Polish (max 80 chars) for a card hook, e.g. "Pomysł na obiad · Rozrywka" — no score, no verdict copy.

            SHORT OR SPARSE PROFILE RULES:
            - If profile.hasSparseProfile is true, do NOT assign professional or hobby unless the match is obvious from the snippet, not title keywords alone.
            - Prefer standard or discovery over guessing.

            OTHER RULES:
            - Language of content does not matter; takeaway and verdict may be Polish.
            - Entertainment and hobbies are valid; do not mark entertain as shallow by default.
            - verdict: exactly two sentences explaining substance, intent, and relevance (or avoidance).
            - summary: 6-8 sentences about the content only.
            - suggestedTags: 3-8 topic tags, not axis labels.

            EXAMPLES:

            Example A — deep + entertain + hobby: User hobbies include cooking. Snippet is a detailed sourdough technique walkthrough presented casually. substanceDepth deep, contentIntent entertain, relevance hobby.

            Example B — shallow + learn + none: AI tools listicle with hype title, no real teaching. substanceDepth shallow, contentIntent learn, relevance none.

            Example C — insufficient_data: contentSnippet null. substanceDepth insufficient_data, contentIntent mixed, relevance none, cautious verdict.

            If embeddingRelevanceHint is present, treat it as a semantic similarity signal (not override substanceDepth). Use it to sanity-check relevance.
            """;

        var resourcePayload = BuildResourcePayload(resource);
        var userPayload = new
        {
            profile = new
            {
                profile.Hobbies,
                profile.ProfessionalContext,
                profile.LearningGoals,
                profile.TopicsToAvoid,
                profile.HasSparseProfile
            },
            resource = resourcePayload,
            contentSnippet = hasSnippet ? contentSnippet : null,
            hasContentSnippet = hasSnippet,
            embeddingRelevanceHint = embeddingHint == null
                ? null
                : new
                {
                    suggestedRelevance = embeddingHint.SuggestedTier.ToString().ToLowerInvariant(),
                    similarity = Math.Round(embeddingHint.Similarity, 3)
                }
        };

        var userPrompt = JsonSerializer.Serialize(userPayload, new JsonSerializerOptions { WriteIndented = false });
        return (systemPrompt, userPrompt);
    }

    private static object BuildResourcePayload(Resource resource)
    {
        if (resource is VideoResource video)
        {
            return new
            {
                title = resource.Title,
                url = resource.Url,
                type = "youtube_video",
                description = resource.Description,
                channel = video.ChannelName,
                durationSeconds = video.Duration,
                viewCount = video.ViewCount
            };
        }

        return new
        {
            title = resource.Title,
            url = resource.Url,
            type = "article",
            description = resource.Description
        };
    }
}
