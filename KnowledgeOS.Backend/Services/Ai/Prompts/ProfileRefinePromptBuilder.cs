using System.Text.Json;
using KnowledgeOS.Backend.DTOs.Users;

namespace KnowledgeOS.Backend.Services.Ai.Prompts;

public static class ProfileRefinePromptBuilder
{
    public static (string SystemPrompt, string UserPrompt) Build(UserPreferenceDto current, string userMessage)
    {
        const string systemPrompt = """
            You are a profile editor for a personal knowledge vault. Output ONLY valid JSON.

            The user describes how their interests, goals, or avoidance rules changed.
            Return the FULL updated profile (all four fields), not a partial delta.
            Preserve existing detail unless the user clearly removes or replaces it.
            Each field max 1000 characters. Use the same language the user writes in.

            Fields:
            - professionalContext: who they are professionally
            - learningGoals: what they want to learn
            - hobbies: passions and leisure interests
            - topicsToAvoid: content they do not want (scoring will cap matches)

            assistantSummary: 2-4 sentences explaining what you changed and why.
            hasChanges: true if any field meaningfully differs from the input profile.
            """;

        var payload = new
        {
            currentProfile = new
            {
                current.ProfessionalContext,
                current.LearningGoals,
                current.Hobbies,
                current.TopicsToAvoid
            },
            userMessage
        };

        var userPrompt = JsonSerializer.Serialize(payload);
        return (systemPrompt, userPrompt);
    }
}
