using System.Text;
using KnowledgeOS.Backend.Entities.Resources;
using KnowledgeOS.Backend.Entities.Resources.ConcreteResources;
using KnowledgeOS.Backend.Services.Abstractions;
using YoutubeExplode;

namespace KnowledgeOS.Backend.Services.Content;

public class YouTubeContentFetcher : IContentFetcher
{
    private readonly ILogger<YouTubeContentFetcher> _logger;
    private readonly YoutubeClient _youtubeClient;

    public YouTubeContentFetcher(ILogger<YouTubeContentFetcher> logger)
    {
        _logger = logger;
        _youtubeClient = new YoutubeClient();
    }

    public bool CanHandle(Resource resource)
    {
        return resource is VideoResource;
    }

    public async Task<string?> FetchContentAsync(Resource resource)
    {
        if (resource is not VideoResource video) return null;

        try
        {
            var sb = new StringBuilder();
            var description = video.Description ?? "";
            if (!string.IsNullOrWhiteSpace(description))
            {
                sb.AppendLine("[VIDEO DESCRIPTION]");
                sb.AppendLine(description);
            }

            var trackManifest = await _youtubeClient.Videos.ClosedCaptions.GetManifestAsync(video.Url);
            var trackInfo = trackManifest.Tracks.FirstOrDefault(lang => lang.Language.Code == "en")
                            ?? trackManifest.Tracks.FirstOrDefault(lang => lang.Language.Code == "pl")
                            ?? trackManifest.Tracks.FirstOrDefault();
            if (trackInfo == null)
                return sb.Length > 0 ? sb.ToString() : null;

            var track = await _youtubeClient.Videos.ClosedCaptions.GetAsync(trackInfo);
            var captions = track.Captions.Select(c => c.Text).ToList();
            var excerpt = TranscriptExcerptBuilder.BuildFromCaptions(captions);

            if (string.IsNullOrWhiteSpace(excerpt))
                return sb.Length > 0 ? sb.ToString() : null;

            if (sb.Length > 0)
                sb.AppendLine("[TRANSCRIPT EXCERPT]");
            sb.Append(excerpt);
            return sb.ToString();
        }
        catch (Exception ex)
        {
            _logger.LogWarning("Failed to fetch subtitles for video {VideoId}: {Message}", video.Id, ex.Message);
            var description = video.Description;
            if (string.IsNullOrWhiteSpace(description))
                return null;

            return $"[VIDEO DESCRIPTION]\n{description}";
        }
    }
}
