using System.Text.Json;
using KnowledgeOS.Backend.Entities.Resources;
using KnowledgeOS.Backend.Entities.Resources.ConcreteResources;
using KnowledgeOS.Backend.Entities.Users;

namespace KnowledgeOS.Backend.Services.Ai.Prompts;

public static class VaultArchivingPromptBuilder
{
    public const string NewCategoryToken = "__NEW__";

    public static (string SystemPrompt, string UserPrompt) Build(
        Resource resource,
        UserPreference? prefs,
        List<string> existingCategories,
        string? contentSnippet)
    {
        var profile = AiProfileDtoFactory.From(prefs);
        var categoryChoices = existingCategories.Any()
            ? existingCategories.ToList()
            : new List<string>();
        categoryChoices.Add(NewCategoryToken);

        var systemPrompt = """
            You are a Knowledge Vault Archiver API. Output ONLY valid JSON matching the schema.

            - categoryChoice: pick EXACTLY one string from categoryChoices in the payload. Use __NEW__ only if no existing category fits.
            - newCategoryName: required when categoryChoice is __NEW__; otherwise omit or empty.
            - Respect topicsToAvoid: do not emphasize avoided topics in summary or tags.
            - summary: essence of the content; highlight angles relevant to learningGoals or hobbies when genuine.
            - suggestedTags: 3-8 specific tags; content topics, not score labels.
            """;

        var resourcePayload = resource is VideoResource video
            ? (object)new
            {
                title = resource.Title,
                url = resource.Url,
                type = "youtube_video",
                description = resource.Description,
                channel = video.ChannelName
            }
            : new
            {
                title = resource.Title,
                url = resource.Url,
                type = "article",
                description = resource.Description
            };

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
            categoryChoices,
            resource = resourcePayload,
            contentSnippet = string.IsNullOrWhiteSpace(contentSnippet) ? null : contentSnippet
        };

        var userPrompt = JsonSerializer.Serialize(userPayload, new JsonSerializerOptions { WriteIndented = false });
        return (systemPrompt, userPrompt);
    }
}
