using KnowledgeOS.Backend.Entities.Users;

namespace KnowledgeOS.Backend.Services.Ai.Prompts;

public record AiProfileDto(
    string Hobbies,
    string ProfessionalContext,
    string LearningGoals,
    string TopicsToAvoid,
    bool HasSparseProfile
);

public static class AiProfileDtoFactory
{
    private const int SparseFieldThreshold = 12;

    public static AiProfileDto From(UserPreference? prefs)
    {
        var hobbies = Normalize(prefs?.Hobbies, "Not specified");
        var professional = Normalize(prefs?.ProfessionalContext, "Not specified");
        var goals = Normalize(prefs?.LearningGoals, "Not specified");
        var avoid = Normalize(prefs?.TopicsToAvoid, "None");

        var sparse = IsSparse(hobbies) && IsSparse(professional) && IsSparse(goals);

        return new AiProfileDto(hobbies, professional, goals, avoid, sparse);
    }

    private static string Normalize(string? value, string fallback) =>
        string.IsNullOrWhiteSpace(value) ? fallback : value.Trim();

    private static bool IsSparse(string value) =>
        value is "Not specified" or "None" or "General Audience" or "General Knowledge"
        || value.Length < SparseFieldThreshold;
}
