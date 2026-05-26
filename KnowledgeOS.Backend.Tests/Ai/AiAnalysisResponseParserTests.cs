using System.Text.Json;
using KnowledgeOS.Backend.Services.Ai;

namespace KnowledgeOS.Backend.Tests.Ai;

public class AiAnalysisResponseParserTests
{
    private const string ValidInboxJson = """
        {
          "correctedTitle": "Better Title",
          "substanceDepth": "deep",
          "contentIntent": "entertain",
          "relevance": "hobby",
          "matchesAvoidance": false,
          "takeaway": "Technika w kuchni · Rozrywka",
          "verdict": "Hobby match because of substantive content.",
          "summary": "A long enough summary of the resource content for testing.",
          "suggestedTags": ["cooking", "technique", "recipe"]
        }
        """;

    [Fact]
    public void ParseInbox_parses_plain_json()
    {
        var dto = AiAnalysisResponseParser.ParseInbox(ValidInboxJson);

        Assert.Equal("Better Title", dto.CorrectedTitle);
        Assert.Equal(3, dto.SuggestedTags!.Length);
    }

    [Fact]
    public void ParseInbox_strips_markdown_fence()
    {
        var wrapped = $"```json\n{ValidInboxJson}\n```";

        var dto = AiAnalysisResponseParser.ParseInbox(wrapped);

        Assert.Equal("deep", dto.SubstanceDepth);
    }

    [Fact]
    public void ParseInbox_truncates_verdict_over_500_chars()
    {
        var longVerdict = new string('x', 600);
        var json = ValidInboxJson.Replace(
            "Hobby match because of substantive content.",
            longVerdict);

        var dto = AiAnalysisResponseParser.ParseInbox(json);

        Assert.Equal(500, dto.Verdict!.Length);
    }

    [Fact]
    public void ParseInbox_throws_when_fewer_than_three_tags()
    {
        var json = ValidInboxJson.Replace(
            """"suggestedTags": ["cooking", "technique", "recipe"]"""",
            """"suggestedTags": ["one", "two"]"""");

        Assert.Throws<InvalidOperationException>(() => AiAnalysisResponseParser.ParseInbox(json));
    }

    [Fact]
    public void ParseInbox_throws_when_json_missing()
    {
        Assert.Throws<JsonException>(() => AiAnalysisResponseParser.ParseInbox("not json at all"));
    }

    [Fact]
    public void ParseVault_resolves_existing_category()
    {
        const string json = """
            {
              "correctedTitle": "Vault Title",
              "summary": "Vault summary with enough text.",
              "suggestedTags": ["a", "b", "c"],
              "categoryChoice": "Tech",
              "newCategoryName": ""
            }
            """;

        var dto = AiAnalysisResponseParser.ParseVault(json);

        Assert.Equal("Tech", dto.ResolveCategoryName());
    }
}
