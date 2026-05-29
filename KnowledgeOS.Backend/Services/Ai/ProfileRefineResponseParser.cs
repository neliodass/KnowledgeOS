using System.Text.Json;
using System.Text.RegularExpressions;

namespace KnowledgeOS.Backend.Services.Ai;

public static class ProfileRefineResponseParser
{
    private const int MaxFieldLength = 1000;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public static ProfileRefineJsonDto Parse(string rawContent)
    {
        var json = ExtractJson(rawContent);
        var dto = JsonSerializer.Deserialize<ProfileRefineJsonDto>(json, JsonOptions)
                  ?? throw new InvalidOperationException("Profile refine response deserialized to null.");

        if (string.IsNullOrWhiteSpace(dto.AssistantSummary))
            throw new InvalidOperationException("Profile refine response missing assistantSummary.");

        dto.AssistantSummary = Truncate(dto.AssistantSummary, MaxFieldLength);
        dto.ProfessionalContext = TruncateNullable(dto.ProfessionalContext);
        dto.LearningGoals = TruncateNullable(dto.LearningGoals);
        dto.Hobbies = TruncateNullable(dto.Hobbies);
        dto.TopicsToAvoid = TruncateNullable(dto.TopicsToAvoid);

        return dto;
    }

    private static string ExtractJson(string raw)
    {
        var trimmed = raw.Trim();
        var fenceMatch = Regex.Match(trimmed, @"```(?:json)?\s*([\s\S]*?)```", RegexOptions.IgnoreCase);
        if (fenceMatch.Success)
            trimmed = fenceMatch.Groups[1].Value.Trim();

        var start = trimmed.IndexOf('{');
        var end = trimmed.LastIndexOf('}');
        if (start < 0 || end <= start)
            throw new JsonException("Profile refine response does not contain a JSON object.");

        return trimmed[start..(end + 1)];
    }

    private static string? TruncateNullable(string? value) =>
        value == null ? null : Truncate(value, MaxFieldLength);

    private static string Truncate(string value, int maxLength) =>
        value.Length <= maxLength ? value : value[..maxLength];
}
