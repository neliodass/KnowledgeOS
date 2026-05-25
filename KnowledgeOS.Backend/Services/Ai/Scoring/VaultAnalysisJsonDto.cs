using System.Text.Json.Serialization;

namespace KnowledgeOS.Backend.Services.Ai.Scoring;

public class VaultAnalysisJsonDto
{
    public string? CorrectedTitle { get; set; }
    public string? Summary { get; set; }
    public string[]? SuggestedTags { get; set; }

    [JsonPropertyName("categoryChoice")]
    public string? CategoryChoice { get; set; }

    [JsonPropertyName("newCategoryName")]
    public string? NewCategoryName { get; set; }

    public string ResolveCategoryName()
    {
        if (string.Equals(CategoryChoice, "__NEW__", StringComparison.OrdinalIgnoreCase))
            return string.IsNullOrWhiteSpace(NewCategoryName) ? "General" : NewCategoryName.Trim();

        return string.IsNullOrWhiteSpace(CategoryChoice) ? "General" : CategoryChoice.Trim();
    }
}
