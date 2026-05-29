using KnowledgeOS.Backend.Services.Ai;

namespace KnowledgeOS.Backend.Tests.Ai;

public class ProfileRefineResponseParserTests
{
    [Fact]
    public void Parse_reads_profile_fields_from_json()
    {
        const string json = """
            {
              "assistantSummary": "Added cooking to hobbies.",
              "professionalContext": "Engineer",
              "learningGoals": "Rust",
              "hobbies": "cooking, hiking",
              "topicsToAvoid": "politics",
              "hasChanges": true
            }
            """;

        var dto = ProfileRefineResponseParser.Parse(json);

        Assert.Equal("cooking, hiking", dto.Hobbies);
        Assert.True(dto.HasChanges);
    }
}
