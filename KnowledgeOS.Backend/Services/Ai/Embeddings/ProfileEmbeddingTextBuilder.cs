using KnowledgeOS.Backend.DTOs.Users;
using KnowledgeOS.Backend.Entities.Users;

namespace KnowledgeOS.Backend.Services.Ai.Embeddings;

public static class ProfileEmbeddingTextBuilder
{
    public static string Build(UserPreference prefs) =>
        Build(prefs.ProfessionalContext, prefs.LearningGoals, prefs.Hobbies, prefs.TopicsToAvoid);

    public static string Build(UserPreferenceDto dto) =>
        Build(dto.ProfessionalContext, dto.LearningGoals, dto.Hobbies, dto.TopicsToAvoid);

    private static string Build(string? professional, string? goals, string? hobbies, string? avoid)
    {
        return $"""
                Professional: {professional ?? ""}
                Learning goals: {goals ?? ""}
                Hobbies: {hobbies ?? ""}
                Avoid: {avoid ?? ""}
                """;
    }
}
