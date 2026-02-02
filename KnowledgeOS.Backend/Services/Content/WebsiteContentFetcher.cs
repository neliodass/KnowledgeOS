using System.Text;
using System.Text.RegularExpressions;
using HtmlAgilityPack;
using KnowledgeOS.Backend.Entities.Resources;
using KnowledgeOS.Backend.Entities.Resources.ConcreteResources;
using KnowledgeOS.Backend.Services.Abstractions;

namespace KnowledgeOS.Backend.Services.Content;

public class WebsiteContentFetcher : IContentFetcher
{
    private readonly ILogger<WebsiteContentFetcher> _logger;
    private readonly HttpClient _httpClient;

    public WebsiteContentFetcher(ILogger<WebsiteContentFetcher> logger)
    {
        _logger = logger;
        _httpClient = new HttpClient();
        _httpClient.DefaultRequestHeaders.Add("User-Agent",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
    }

    public bool CanHandle(Resource resource)
    {
        return resource is ArticleResource;
    }

    public async Task<string?> FetchContentAsync(Resource resource)
    {
        if (resource is not ArticleResource) return null;

        try
        {
            var html = await _httpClient.GetStringAsync(resource.Url);
            var doc = new HtmlDocument();
            doc.LoadHtml(html);

            foreach (var node in doc.DocumentNode.SelectNodes("//script|//style|//header|//footer|//nav") ??
                                 new HtmlNodeCollection(null))
                node.Remove();

            var sb = new StringBuilder();

            var paragraphs = doc.DocumentNode.SelectNodes("//p | //article | //h1 | //h2 | //h3 | //li");

            var contentNodes =
                doc.DocumentNode.SelectNodes(
                    "//article | //p | //li | //h1 | //h2 | //h3 | //h4 | //h5 | //h6 | //blockquote");

            if (contentNodes != null && contentNodes.Count > 0)
                foreach (var node in contentNodes)
                {
                    var text = CleanText(node.InnerText);
                    if (IsUsefulContent(text)) sb.AppendLine(text);
                }

            if (sb.Length < 200)
            {
                var bodyText = doc.DocumentNode.SelectSingleNode("//body")?.InnerText;
                if (!string.IsNullOrWhiteSpace(bodyText))
                {
                    var lines = bodyText.Split(new[] { '\n', '\r' }, StringSplitOptions.RemoveEmptyEntries);
                    foreach (var line in lines)
                    {
                        var text = CleanText(line);
                        if (IsUsefulContent(text)) sb.AppendLine(text);
                    }
                }
            }

            var content = sb.ToString();
            return content.Length > 50000 ? content[..50000] : content;
        }
        catch (Exception ex)
        {
            _logger.LogWarning($"Failed to fetch website content for {resource.Id}: {ex.Message}");
            return null;
        }
    }

    private string CleanText(string input)
    {
        if (string.IsNullOrWhiteSpace(input)) return string.Empty;
        var text = System.Net.WebUtility.HtmlDecode(input);
        return Regex.Replace(text, @"\s+", " ").Trim();
    }

    private bool IsUsefulContent(string text)
    {
        return text.Length > 20 || (text.Length > 5 && text.Contains(" "));
    }
}