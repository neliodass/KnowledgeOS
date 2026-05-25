using System.Text.Json;
using KnowledgeOS.Backend.Entities.Resources;
using KnowledgeOS.Backend.Entities.Resources.ConcreteResources;
using KnowledgeOS.Backend.Entities.Users;

namespace KnowledgeOS.Backend.Services.Ai.Prompts;

public static class InboxScoringPromptBuilder
{
    public static (string SystemPrompt, string UserPrompt) Build(
        Resource resource,
        UserPreference? prefs,
        string? contentSnippet)
    {
        var profile = AiProfileDtoFactory.From(prefs);
        var hasSnippet = !string.IsNullOrWhiteSpace(contentSnippet);

        var systemPrompt = """
            You are a personalized knowledge curator API. Output ONLY valid JSON matching the schema.

            Evaluate in two steps:
            1) intrinsicQuality — substance of the content itself (not user fit).
            2) relevance — fit to the user's profile in the JSON payload.

            intrinsicQuality values:
            - high: genuine craft, depth, expertise, real effort, or substantive long-form conversation.
            - low: reaction bait, hype listicles, drama/spectacle, keyword stuffing without substance.
            - insufficient_data: contentSnippet is null or too thin to judge substance; use only title/description/metadata.

            relevance values (only when intrinsicQuality is high or low, NOT insufficient_data):
            - professional: clearly serves professionalContext or learningGoals.
            - hobby: content genuinely IS or deeply engages a stated hobby (not a keyword in the title alone).
            - discovery: no profile match but objectively compelling craftsmanship or achievement.
            - standard: decent general content, weak or no profile tie.
            - none: use when intrinsicQuality is insufficient_data.

            matchesAvoidance: true only if content clearly matches topicsToAvoid in the profile.

            SHORT OR SPARSE PROFILE RULES:
            - If profile.hasSparseProfile is true, do NOT assign professional or hobby unless the match is obvious from the snippet, not from title keywords alone.
            - Prefer standard or discovery over guessing.

            OTHER RULES:
            - Language of content does not matter.
            - Entertainment and hobbies are valid high-quality content.
            - verdict: exactly two sentences naming the quality and relevance (or avoidance) reason.
            - summary: 6-8 sentences about the content only; do not explain why it mismatches the user.
            - suggestedTags: 3-8 tags describing the content topic, not the score.

            EXAMPLES (do not copy profile fields from examples):

            Example A — high + hobby: User hobbies include cooking. Snippet shows a detailed recipe walkthrough with technique. Result: intrinsicQuality high, relevance hobby.

            Example B — low + none: Title says "AI tools you NEED!!!" Snippet is a shallow listicle. Result: intrinsicQuality low, relevance none.

            Example C — insufficient_data: contentSnippet null, only title and description. Result: intrinsicQuality insufficient_data, relevance none, cautious verdict noting limited evidence.
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
            hasContentSnippet = hasSnippet
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
