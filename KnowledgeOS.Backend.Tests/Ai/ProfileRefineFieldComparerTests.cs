using KnowledgeOS.Backend.DTOs.Users;
using KnowledgeOS.Backend.Services.Ai;

namespace KnowledgeOS.Backend.Tests.Ai;

public class ProfileRefineFieldComparerTests
{
    [Fact]
    public void GetChangedFields_detects_single_field_change()
    {
        var current = new UserPreferenceDto { Hobbies = "gaming" };
        var proposed = new UserPreferenceDto { Hobbies = "cooking, travel" };

        var changed = ProfileRefineFieldComparer.GetChangedFields(current, proposed);

        Assert.Single(changed);
        Assert.Equal("hobbies", changed[0]);
    }

    [Fact]
    public void GetChangedFields_returns_empty_when_unchanged()
    {
        var dto = new UserPreferenceDto
        {
            ProfessionalContext = "dev",
            LearningGoals = "kafka",
            Hobbies = "rpg",
            TopicsToAvoid = "politics"
        };

        Assert.Empty(ProfileRefineFieldComparer.GetChangedFields(dto, dto));
    }
}
