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
            var trackManifest = await _youtubeClient.Videos.ClosedCaptions.GetManifestAsync(video.Url);
            var trackInfo = trackManifest.Tracks.FirstOrDefault(lang => lang.Language.Code == "en")
                            ?? trackManifest.Tracks.FirstOrDefault(lang => lang.Language.Code == "pl") ??
                            trackManifest.Tracks.FirstOrDefault();
            if (trackInfo == null) return null;

            var track = await _youtubeClient.Videos.ClosedCaptions.GetAsync(trackInfo);

            var sb = new StringBuilder();
            int charCount = 0;
            const int maxChars = 100000;

            foreach (var caption in track.Captions)
            {
                if (charCount > maxChars) break;
                sb.AppendLine(caption.Text);
                charCount += caption.Text.Length;
            }

            return sb.ToString();
        }
        catch (Exception ex)
        {
            _logger.LogWarning($"Failed to fetch subtitles for video {video.Id}: {ex.Message}");
            return null;
        }
    }
}