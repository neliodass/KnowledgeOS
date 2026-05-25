using KnowledgeOS.Backend.DTOs.Users;

namespace KnowledgeOS.Backend.Services.Ai;

public static class ProfileRefineFieldComparer
{
    private static readonly string[] FieldNames =
    [
        "professionalContext",
        "learningGoals",
        "hobbies",
        "topicsToAvoid"
    ];

    public static string[] GetChangedFields(UserPreferenceDto current, UserPreferenceDto proposed)
    {
        var changed = new List<string>();

        if (!FieldsEqual(current.ProfessionalContext, proposed.ProfessionalContext))
            changed.Add("professionalContext");
        if (!FieldsEqual(current.LearningGoals, proposed.LearningGoals))
            changed.Add("learningGoals");
        if (!FieldsEqual(current.Hobbies, proposed.Hobbies))
            changed.Add("hobbies");
        if (!FieldsEqual(current.TopicsToAvoid, proposed.TopicsToAvoid))
            changed.Add("topicsToAvoid");

        return changed.ToArray();
    }

    public static bool HasChanges(string[] changedFields) => changedFields.Length > 0;

    private static bool FieldsEqual(string? a, string? b) =>
        string.Equals(Normalize(a), Normalize(b), StringComparison.Ordinal);

    private static string Normalize(string? value) => string.IsNullOrWhiteSpace(value) ? "" : value.Trim();
}
