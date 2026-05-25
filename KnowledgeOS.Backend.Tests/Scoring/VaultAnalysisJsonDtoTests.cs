using KnowledgeOS.Backend.Services.Ai.Scoring;

namespace KnowledgeOS.Backend.Tests.Scoring;

public class VaultAnalysisJsonDtoTests
{
    [Fact]
    public void ResolveCategoryName_returns_new_name_when_choice_is___NEW__()
    {
        var dto = new VaultAnalysisJsonDto
        {
            CategoryChoice = "__NEW__",
            NewCategoryName = "  Cooking  "
        };

        Assert.Equal("Cooking", dto.ResolveCategoryName());
    }

    [Fact]
    public void ResolveCategoryName_returns_General_when___NEW___without_name()
    {
        var dto = new VaultAnalysisJsonDto { CategoryChoice = "__NEW__" };

        Assert.Equal("General", dto.ResolveCategoryName());
    }

    [Fact]
    public void ResolveCategoryName_returns_existing_choice()
    {
        var dto = new VaultAnalysisJsonDto { CategoryChoice = "Science" };

        Assert.Equal("Science", dto.ResolveCategoryName());
    }
}
