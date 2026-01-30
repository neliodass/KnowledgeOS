using KnowledgeOS.Backend.Data;
using KnowledgeOS.Backend.Entities.Resources;
using KnowledgeOS.Backend.Entities.Resources.ConcreteResources;
using KnowledgeOS.Backend.Services.Abstractions;
using YoutubeExplode;
using YoutubeExplode.Common;

namespace KnowledgeOS.Backend.Jobs;

public class UrlIngestionJob : IUrlIngestionJob
{
    private readonly AppDbContext _context;
    private readonly ILogger<UrlIngestionJob> _logger;
    private readonly YoutubeClient _youtubeClient;

    public UrlIngestionJob(AppDbContext context, ILogger<UrlIngestionJob> logger)
    {
        _context = context;
        _logger = logger;
        _youtubeClient = new YoutubeClient();
    }

    public async Task ProcessAsync(Guid resourceId)
    {
        _logger.LogInformation($"Starting to process resource: {resourceId}");
        var resource = await _context.Resources.FindAsync(resourceId);
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
            {
                await ProcessVideoAsync(videoResource);
            }
            else if (resource is ArticleResource articleResource)
            {
                // TODO: Article scraping logic here
                articleResource.Title = "TODO: Pobrać tytuł strony";
            }

            _logger.LogInformation($"Finished with sucess: {resource.Title}");
            await _context.SaveChangesAsync();
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

        video.Title = metadata.Title;
        video.Description = metadata.Description;
        video.ChannelName = metadata.Author.ChannelTitle;
        video.Duration = metadata.Duration;
        video.ViewCount = metadata.Engagement.ViewCount;
        var thumbnail = metadata.Thumbnails.GetWithHighestResolution();
        video.ImageUrl = thumbnail.Url;
    }
}