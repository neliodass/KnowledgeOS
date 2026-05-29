using System.Text;

namespace KnowledgeOS.Backend.Services.Content;

public static class TranscriptExcerptBuilder
{
    public static string BuildFromCaptions(IReadOnlyList<string> captionTexts, int maxChars = 6000)
    {
        if (captionTexts.Count == 0)
            return string.Empty;

        var fullText = string.Join(" ", captionTexts.Select(t => t.Trim()).Where(t => t.Length > 0));
        if (fullText.Length <= maxChars)
            return fullText;

        var beginBudget = (int)(maxChars * 0.4);
        var middleBudget = (int)(maxChars * 0.2);
        var endBudget = maxChars - beginBudget - middleBudget - 80;

        var begin = fullText[..beginBudget];
        var middleStart = fullText.Length / 2 - middleBudget / 2;
        if (middleStart < beginBudget) middleStart = beginBudget;
        var middle = fullText.Substring(middleStart, Math.Min(middleBudget, fullText.Length - middleStart));
        var end = fullText[^endBudget..];

        var sb = new StringBuilder();
        sb.AppendLine("[BEGIN]");
        sb.AppendLine(begin);
        sb.AppendLine("[MIDDLE]");
        sb.AppendLine(middle);
        sb.AppendLine("[END]");
        sb.AppendLine(end);
        return sb.ToString();
    }
}
