using System.Text.Json;
using System.Text.RegularExpressions;
using KnowledgeOS.Backend.Services.Ai.Scoring;

namespace KnowledgeOS.Backend.Services.Ai;

public static class AiAnalysisResponseParser
{
    private const int MaxVerdictLength = 500;
    private const int MinTags = 3;
    private const int MaxTags = 8;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public static InboxAnalysisJsonDto ParseInbox(string rawContent)
    {
        var json = ExtractJson(rawContent);
        var dto = JsonSerializer.Deserialize<InboxAnalysisJsonDto>(json, JsonOptions)
                  ?? throw new InvalidOperationException("Inbox AI response deserialized to null.");

        if (string.IsNullOrWhiteSpace(dto.CorrectedTitle))
            throw new InvalidOperationException("Inbox AI response missing correctedTitle.");
        if (string.IsNullOrWhiteSpace(dto.Verdict))
            throw new InvalidOperationException("Inbox AI response missing verdict.");
        if (string.IsNullOrWhiteSpace(dto.Summary))
            throw new InvalidOperationException("Inbox AI response missing summary.");

        dto.Verdict = Truncate(dto.Verdict, MaxVerdictLength);
        dto.SuggestedTags = NormalizeTags(dto.SuggestedTags);

        return dto;
    }

    public static VaultAnalysisJsonDto ParseVault(string rawContent)
    {
        var json = ExtractJson(rawContent);
        var dto = JsonSerializer.Deserialize<VaultAnalysisJsonDto>(json, JsonOptions)
                  ?? throw new InvalidOperationException("Vault AI response deserialized to null.");

        if (string.IsNullOrWhiteSpace(dto.CorrectedTitle))
            throw new InvalidOperationException("Vault AI response missing correctedTitle.");
        if (string.IsNullOrWhiteSpace(dto.Summary))
            throw new InvalidOperationException("Vault AI response missing summary.");

        dto.SuggestedTags = NormalizeTags(dto.SuggestedTags);

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
            throw new JsonException("AI response does not contain a JSON object.");

        return trimmed[start..(end + 1)];
    }

    private static string Truncate(string value, int maxLength) =>
        value.Length <= maxLength ? value : value[..maxLength];

    private static string[] NormalizeTags(string[]? tags)
    {
        var normalized = (tags ?? Array.Empty<string>())
            .Select(t => t.Trim())
            .Where(t => !string.IsNullOrWhiteSpace(t))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .Take(MaxTags)
            .ToArray();

        if (normalized.Length < MinTags)
            throw new InvalidOperationException(
                $"AI returned {normalized.Length} tags; expected at least {MinTags}.");

        return normalized;
    }
}
