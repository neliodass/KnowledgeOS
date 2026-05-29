using KnowledgeOS.Backend.Entities.Users;
using KnowledgeOS.Backend.Services.Ai.Prompts;

namespace KnowledgeOS.Backend.Tests.Prompts;

public class AiProfileDtoFactoryTests
{
    [Fact]
    public void From_null_preferences_yields_sparse_profile()
    {
        var dto = AiProfileDtoFactory.From(null);

        Assert.True(dto.HasSparseProfile);
        Assert.Equal("Not specified", dto.Hobbies);
        Assert.Equal("None", dto.TopicsToAvoid);
    }

    [Fact]
    public void From_rich_preferences_is_not_sparse()
    {
        var prefs = new UserPreference
        {
            Hobbies = "Tabletop RPG campaigns and narrative games",
            ProfessionalContext = "Backend developer working on distributed systems",
            LearningGoals = "Kafka, event-driven architecture, observability",
            TopicsToAvoid = "Political outrage content"
        };

        var dto = AiProfileDtoFactory.From(prefs);

        Assert.False(dto.HasSparseProfile);
        Assert.Equal("Political outrage content", dto.TopicsToAvoid);
    }

    [Fact]
    public void From_short_hobby_only_is_sparse()
    {
        var prefs = new UserPreference { Hobbies = "cooking" };

        var dto = AiProfileDtoFactory.From(prefs);

        Assert.True(dto.HasSparseProfile);
    }
}
