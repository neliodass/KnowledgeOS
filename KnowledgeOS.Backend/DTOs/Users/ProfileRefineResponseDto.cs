namespace KnowledgeOS.Backend.DTOs.Users;

public class ProfileRefineResponseDto
{
    public string AssistantSummary { get; set; } = string.Empty;
    public UserPreferenceDto ProposedPreferences { get; set; } = new();
    public string[] ChangedFields { get; set; } = Array.Empty<string>();
    public bool HasChanges { get; set; }
}
