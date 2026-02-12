using System.Net;
using Hangfire;
using HtmlAgilityPack;
using KnowledgeOS.Backend.Data;
using KnowledgeOS.Backend.Entities.Resources;
using KnowledgeOS.Backend.Entities.Resources.ConcreteResources;
using KnowledgeOS.Backend.Jobs.Abstractions;
using KnowledgeOS.Backend.Services.Abstractions;
using Microsoft.EntityFrameworkCore;
using YoutubeExplode;
using YoutubeExplode.Common;

namespace KnowledgeOS.Backend.Jobs;

public class UrlIngestionJob : IUrlIngestionJob
{
    private readonly AppDbContext _context;
    private readonly ILogger<UrlIngestionJob> _logger;
    private readonly IBackgroundJobClient _backgroundJobClient;
    private readonly YoutubeClient _youtubeClient;
    private readonly HttpClient _httpClient;

    public UrlIngestionJob(AppDbContext context, ILogger<UrlIngestionJob> logger,
        IBackgroundJobClient backgroundJobClient)
    {
        _context = context;
        _logger = logger;
        _backgroundJobClient = backgroundJobClient;
        _youtubeClient = new YoutubeClient();
        _httpClient = new HttpClient();
        _httpClient.DefaultRequestHeaders.Add("User-Agent",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
    }

    public async Task ProcessAsync(Guid resourceId)
    {
        _logger.LogInformation($"Starting to process resource: {resourceId}");
        var resource = await _context.Resources.IgnoreQueryFilters().FirstOrDefaultAsync(r => r.Id == resourceId);
        if (resource == null)
        {
            _logger.LogError($"Can't find resrouce: {resourceId}");
            return;
        }

        try
        {
            resource.Status = ResourceStatus.Processing;
            await _context.SaveChangesAsync();
            if (resource is VideoResource videoResource)
                await ProcessVideoAsync(videoResource);
            else if (resource is ArticleResource articleResource) await ProcessArticleAsync(articleResource);

            await _context.SaveChangesAsync();
            _logger.LogInformation($"Finished with sucess: {resource.Title}");

            _backgroundJobClient.Enqueue<IAiAnalysisJob>(job => job.ProcessAsync(resource.Id));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing resource");
            resource.Status = ResourceStatus.Error;
            await _context.SaveChangesAsync();
        }
    }

    private async Task ProcessVideoAsync(VideoResource video)
    {
        var metadata = await _youtubeClient.Videos.GetAsync(video.Url);

        video.Title = metadata.Title.Length > 500
            ? metadata.Title[..497] + "..."
            : metadata.Title;
        var description = metadata.Description ?? "";
        video.Description = description.Length > 2000
            ? description[..1997] + "..."
            : description;
        video.ChannelName = metadata.Author.ChannelTitle ?? "Unknown";
        video.Duration = metadata.Duration;
        video.ViewCount = metadata.Engagement.ViewCount;
        var thumbnail = metadata.Thumbnails.GetWithHighestResolution();
        video.ImageUrl = thumbnail.Url;
    }

    private async Task ProcessArticleAsync(ArticleResource article)
    {
        var web = new HtmlWeb();
        var html = await _httpClient.GetStringAsync(article.Url);
        var doc = new HtmlDocument();
        doc.LoadHtml(html);

        // title
        var titleNode = doc.DocumentNode.SelectSingleNode("//title");
        var title = titleNode?.InnerText ?? "No Title";

        title = WebUtility.HtmlDecode(title).Trim();
        article.Title = title.Length > 500 ? title[..497] + "..." : title;

        // meta description
        var descNode = doc.DocumentNode.SelectSingleNode("//meta[@name='description']");
        var description = descNode?.GetAttributeValue("content", "") ?? "";

        description = WebUtility.HtmlDecode(description).Trim();
        article.Description = description.Length > 2000 ? description[..1997] + "..." : description;

        // site name
        var siteNameNode = doc.DocumentNode.SelectSingleNode("//meta[@property='og:site_name']");
        article.SiteName = siteNameNode?.GetAttributeValue("content", "") ?? new Uri(article.Url).Host;
    }
}