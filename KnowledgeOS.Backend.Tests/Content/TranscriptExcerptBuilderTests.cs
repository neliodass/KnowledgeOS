using KnowledgeOS.Backend.Services.Content;

namespace KnowledgeOS.Backend.Tests.Content;

public class TranscriptExcerptBuilderTests
{
    [Fact]
    public void BuildFromCaptions_returns_empty_for_no_captions()
    {
        Assert.Equal(string.Empty, TranscriptExcerptBuilder.BuildFromCaptions([]));
    }

    [Fact]
    public void BuildFromCaptions_returns_full_text_when_under_budget()
    {
        var captions = new[] { "hello", "world" };

        var result = TranscriptExcerptBuilder.BuildFromCaptions(captions, maxChars: 1000);

        Assert.Equal("hello world", result);
        Assert.DoesNotContain("[BEGIN]", result);
    }

    [Fact]
    public void BuildFromCaptions_includes_begin_middle_end_sections_when_over_budget()
    {
        var captions = Enumerable.Repeat("word", 5000).ToArray();

        var result = TranscriptExcerptBuilder.BuildFromCaptions(captions, maxChars: 200);

        Assert.Contains("[BEGIN]", result);
        Assert.Contains("[MIDDLE]", result);
        Assert.Contains("[END]", result);
    }
}
