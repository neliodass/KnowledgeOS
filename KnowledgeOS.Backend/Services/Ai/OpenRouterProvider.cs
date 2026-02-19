using System.Diagnostics;
using System.Text.Json;
using KnowledgeOS.Backend.Entities.Resources;
using KnowledgeOS.Backend.Entities.Users;
using KnowledgeOS.Backend.Services.Abstractions;
using KnowledgeOS.Backend.Services.Ai.Abstractions;
using OpenAI;
using OpenAI.Chat;

namespace KnowledgeOS.Backend.Services.Ai;

public class OpenRouterProvider : IAiProvider
{
    private readonly OpenAIClient _openAiClient;
    private readonly string _modelId;
    private readonly ILogger<OpenRouterProvider> _logger;

    public string Name => $"OpenRouter ({_modelId})";

    public OpenRouterProvider(OpenAIClient openAiClient, string modelId, ILogger<OpenRouterProvider> logger)
    {
        _openAiClient = openAiClient;
        _modelId = modelId;
        _logger = logger;
    }

    public async Task<InboxAnalysisResult> AnalyzeForInboxAsync(Resource resource, UserPreference? userPreferences,
        string? extraContext = null)
    {
        var options = BuildInboxOptions();
        var (systemPrompt, userPrompt) = BuildInboxPrompts(resource, userPreferences, extraContext);

        var content = await CallAiWithRetryAsync(systemPrompt, userPrompt, options);
        var result = JsonSerializer.Deserialize<InboxJsonResult>(content,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        return new InboxAnalysisResult(
            result?.CorrectedTitle ?? resource.Title,
            result?.Score ?? 0,
            result?.Verdict ?? "No verdict.",
            result?.Summary ?? "No summary.",
            result?.SuggestedTags ?? Array.Empty<string>()
        );
    }

    public async Task<VaultAnalysisResult> AnalyzeForVaultAsync(Resource resource, UserPreference? userPreferences,
        List<string> existingCategories, string? extraContext = null)
    {
        var options = BuildVaultOptions();
        var (systemPrompt, userPrompt) = BuildVaultPrompts(resource, userPreferences, existingCategories, extraContext);
        
        var content = await CallAiWithRetryAsync(systemPrompt, userPrompt, options);
        var result = JsonSerializer.Deserialize<VaultJsonResult>(content,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        return new VaultAnalysisResult(
            result?.CorrectedTitle ?? resource.Title,
            result?.Summary ?? "No summary.",
            result?.SuggestedTags ?? Array.Empty<string>(),
            result?.SuggestedCategoryName ?? "General"
        );
    }

    private async Task<string> CallAiWithRetryAsync(string systemPrompt, string userPrompt, ChatCompletionOptions options)
    {
        var chatClient = _openAiClient.GetChatClient(_modelId);
        var messages = new List<ChatMessage>
        {
            new SystemChatMessage(systemPrompt),
            new UserChatMessage(userPrompt)
        };

        for (var attempt = 1; attempt <= 2; attempt++)
            try
            {
                ChatCompletion completion = await chatClient.CompleteChatAsync(messages, options);
                var text = completion.Content[0].Text;
                if (string.IsNullOrWhiteSpace(text)) throw new InvalidOperationException("AI returned empty response.");
                return text;
            }
            catch (Exception ex)
            {
                _logger.LogWarning($"Attempt {attempt} failed for model {_modelId}: {ex.Message}");
                if (attempt == 2) throw;
                await Task.Delay(1000);
            }

        throw new UnreachableException();
    }

    private ChatCompletionOptions BuildInboxOptions()
    {
        return new ChatCompletionOptions
        {
            Temperature = 0.1f,
            ResponseFormat = ChatResponseFormat.CreateJsonSchemaFormat(
                "inbox_analysis",
                BinaryData.FromObjectAsJson(new
                {
                    type = "object",
                    properties = new
                    {
                        correctedTitle = new { type = "string", description = "A better, more descriptive title." },
                        score = new { type = "integer", description = "Relevance 0-100 based on user context." },
                        verdict = new { type = "string", description = "Two sentences explaining the score." },
                        summary = new
                            { type = "string", description = "Summarize whole content in around 6-8 sentences. Do not provide there why it doesn't suit user." },
                        suggestedTags = new { type = "array", items = new { type = "string" } }
                    },
                    required = new[] { "correctedTitle", "score", "verdict", "summary", "suggestedTags" },
                    additionalProperties = false
                }, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase }),
                jsonSchemaIsStrict: true)
        };
    }

    private ChatCompletionOptions BuildVaultOptions()
    {
        return new ChatCompletionOptions
        {
            Temperature = 0.1f,
            ResponseFormat = ChatResponseFormat.CreateJsonSchemaFormat(
                "vault_analysis",
                BinaryData.FromObjectAsJson(new
                {
                    type = "object",
                    properties = new
                    {
                        correctedTitle = new { type = "string", description = "Final polished title for the vault." },
                        summary = new { type = "string", description = "Detailed essence of the content." },
                        suggestedTags = new { type = "array", items = new { type = "string" } },
                        suggestedCategoryName = new
                        {
                            type = "string",
                            description =
                                "The best matching category name from the provided list, or a new one if none fit."
                        }
                    },
                    required = new[] { "correctedTitle", "summary", "suggestedTags", "suggestedCategoryName" },
                    additionalProperties = false
                }, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase }),
                jsonSchemaIsStrict: true)
        };
    }

private (string SystemPrompt, string UserPrompt) BuildInboxPrompts(Resource resource, UserPreference? prefs, string? content)
{
    var systemPrompt = """
        You are a highly personalized knowledge curator API. You output ONLY valid JSON.
        Evaluate content using the TWO-AXIS system below: first assess INTRINSIC QUALITY, then assess RELEVANCE TO USER PROFILE.

        ═══════════════════════════════════════════
        AXIS 1: INTRINSIC QUALITY (what is this content, really?)
        ═══════════════════════════════════════════

        Ask: What is the actual substance being delivered here? Who made the effort and what kind?

        HIGH QUALITY signals (any of these):
        - Genuine human activity being recorded or documented (a real game session, a real performance, a real build)
        - Demonstrated skill, craft, preparation, or domain knowledge
        - Narrative depth, creative richness, or intellectual rigor
        - Real consequences, real effort, real stakes (documentary, long-form project)
        - The creator IS the subject (builder, player, performer, expert)

        LOW QUALITY signals (any of these that dominate the content):
        - The creator's only contribution is a reaction to someone else's content ("watching X", "reacting to Y")
        - Manufactured urgency or hype with no substance ("you NEED this", "life-changing")
        - The topic keyword appears in title but the actual content doesn't engage with it seriously
        - AI or automation used as a gimmick rather than explored meaningfully ("I made 8 AIs order me McDonald's")
        - Content about a person's personality/drama rather than their work or ideas
        - The primary value proposition is entertainment through someone else's breakdown, suffering, or spectacle

        ═══════════════════════════════════════════
        AXIS 2: RELEVANCE TO USER PROFILE
        ═══════════════════════════════════════════

        Only after assessing quality, check relevance:

        A) HOBBY/PASSION MATCH: Content genuinely IS or deeply engages with a listed hobby -> high relevance bonus
        B) PROFESSIONAL/GOAL MATCH: Content substantively addresses professional context or learning goals -> high relevance bonus
        C) DISCOVERY: No profile match, but extraordinary human achievement, craftsmanship, or feat -> moderate relevance
        D) STANDARD: Decent content, tangential or no profile connection
        E) AVOIDANCE OVERRIDE: Content matches "Topics to Avoid" -> cap final score at 10

        ═══════════════════════════════════════════
        FINAL SCORE LOGIC
        ═══════════════════════════════════════════

        High Quality + Hobby/Professional Match  -> 80-100
        High Quality + Discovery                 -> 60-79
        High Quality + Standard                  -> 35-59
        Low Quality + any topic                  -> 0-25 (quality dominates, relevance irrelevant)
        Any quality + Avoidance match            -> 0-10 (override)

        ═══════════════════════════════════════════
        CRITICAL RULES
        ═══════════════════════════════════════════

        - LANGUAGE IS IRRELEVANT. Polish, Japanese, Spanish — evaluate what the content IS, not what language it is in.
        - SAME SERIES = SAME QUALITY. If a content series (e.g. episodes of the same RPG campaign) is genuine hobby content, all episodes of that series are equally valid. Do not re-evaluate series consistency per episode.
        - KEYWORD ≠ RELEVANCE. A topic keyword in the title does not trigger a hobby match. The content must genuinely engage with the topic.
        - ENTERTAINMENT IS VALID. A funny, richly narrated RPG session is high quality. A genuine live DJ set is high quality. Do not penalize content for being entertaining rather than educational.
        - The verdict must name the specific profile field or quality reason that drove the score.
        - Do NOT inherit interests from examples below.

        ═══════════════════════════════════════════
        EXAMPLES
        ═══════════════════════════════════════════

        [EXAMPLE 1: High Quality + Hobby Match — RPG session episode]
        User Profile: Hobbies: "Tabletop RPGs".
        Content: "Polish RPG session recording, Call of Cthulhu campaign, episode 17. Players explore a flooded town, rich narrative, dice rolls, in-character dialogue."
        Quality assessment: Genuine play session. Rich narrative, real human effort, the creators ARE the players. HIGH QUALITY.
        Relevance: Content IS a tabletop RPG session. Direct hobby match. Language irrelevant.
        Result: Score 92. Verdict: "Hobby Match: Genuine RPG session recording from an ongoing campaign, directly matches your listed hobby."

        [EXAMPLE 2: Low Quality — reaction to unhinged streamer]
        User Profile: Hobbies: "Gaming, streaming culture".
        Content: "Streamer reacts to Makailer (known for erratic, chaotic behaviour) screaming about building an AI system."
        Quality assessment: The content is pure spectacle of someone's mental state. Reactor adds no analysis. Value comes entirely from watching someone else's breakdown. LOW QUALITY.
        Relevance: Gaming keyword present, but content does not engage with gaming meaningfully.
        Result: Score 14. Verdict: "Rejected: Reaction content whose value is spectacle of another person's erratic behaviour — no real substance."

        [EXAMPLE 3: Low Quality — AI keyword, gimmick content]
        User Profile: Hobbies: "AI, computer science".
        Content: "I made 8 different AI models place a McDonald's order for me — who wins??"
        Quality assessment: AI is used as a prop for a gimmick. No technical depth, no meaningful exploration of AI. LOW QUALITY.
        Relevance: "AI" keyword appears but content does not engage with AI seriously.
        Result: Score 16. Verdict: "Rejected: AI used as a gimmick with no technical or intellectual substance."

        [EXAMPLE 4: High Quality + Discovery — extraordinary human feat]
        User Profile: Hobbies: "Cooking". Professional: "Accountant".
        Content: "Documentary: man swims 160km across the Baltic Sea solo, full journey documented."
        Quality assessment: Extraordinary real human achievement, deeply documented. HIGH QUALITY.
        Relevance: No profile match whatsoever. But the feat is objectively remarkable — Discovery.
        Result: Score 74. Verdict: "Discovery: Extraordinary human endurance feat with no direct profile match, but genuinely compelling."

        [EXAMPLE 5: Low Quality — hype listicle despite hobby keyword]
        User Profile: Hobbies: "AI, computer science".
        Content: "7 AI Tools You NEED in 2025 (This Will CHANGE Your Life!)"
        Quality assessment: Manufactured urgency, no depth, listicle format designed for clicks. LOW QUALITY.
        Result: Score 17. Verdict: "Rejected: Hype listicle with no real substance despite touching on your interest area."

        [EXAMPLE 6: High Quality + Professional Match]
        User Profile: Professional: "Backend developer". Goals: "Learn distributed systems".
        Content: "Deep dive into Kafka consumer groups, partition rebalancing, and offset management."
        Quality assessment: Substantive technical content, requires domain expertise to produce. HIGH QUALITY.
        Relevance: Direct professional and learning goal match.
        Result: Score 96. Verdict: "Professional Match: Substantive deep dive directly relevant to your distributed systems learning goal."
        """;

    var resourceMeta = new System.Text.StringBuilder();
    resourceMeta.AppendLine($"Title: {resource.Title}");
    resourceMeta.AppendLine($"URL: {resource.Url}");
    if (!string.IsNullOrWhiteSpace(resource.Description))
        resourceMeta.AppendLine($"Description: {resource.Description}");

    if (resource is Entities.Resources.ConcreteResources.VideoResource video)
    {
        resourceMeta.AppendLine($"Content Type: YouTube Video");
        resourceMeta.AppendLine($"Channel: {video.ChannelName}");
        if (video.Duration.HasValue)
            resourceMeta.AppendLine($"Duration: {video.Duration.Value}");
        resourceMeta.AppendLine($"Views: {video.ViewCount:N0}");
    }
    else
    {
        resourceMeta.AppendLine($"Content Type: Article / Website");
    }

    var userPrompt = $"""
        USER PROFILE:
        - Hobbies/Interests: {prefs?.Hobbies ?? "Not specified"}
        - Professional Context: {prefs?.ProfessionalContext ?? "General Audience"}
        - Learning Goals: {prefs?.LearningGoals ?? "General Knowledge"}
        - Topics to Avoid: {prefs?.TopicsToAvoid ?? "None"}

        RESOURCE TO EVALUATE:
        {resourceMeta}
        Content Snippet:
        {content ?? "N/A"}
        """;

    return (systemPrompt, userPrompt);
}

private (string SystemPrompt, string UserPrompt) BuildVaultPrompts(Resource resource, UserPreference? prefs, List<string> categories, string? content)
{
    var cats = categories.Any() ? string.Join(", ", categories) : "None (Propose a new one)";
        
    var systemPrompt = """
                       You are a Knowledge Vault Archiver API. You output ONLY valid JSON.
                       Your job is to categorize, title, summarize, and tag content through the lens of the specific user's perspective. 

                       INSTRUCTIONS:
                       1. CATEGORY: Match exactly from the user's "EXISTING CATEGORIES" if possible. If none fit perfectly, invent a concise new category name inspired by the user's Hobbies or Professional Context.
                       2. SUMMARY: Extract the essence of the content. Tailor the focus to highlight aspects relevant to the user's defined "Learning Goals" or "Hobbies".
                       3. TAGS: 3-5 tags. Use niche/specific vocabulary related to the user's profile where applicable.
                       """;

    var userPrompt = $"""
                      USER CONTEXT:
                      - Hobbies/Interests: {prefs?.Hobbies ?? "Not specified"}
                      - Professional Context: {prefs?.ProfessionalContext ?? "General Audience"}
                      - Learning Goals: {prefs?.LearningGoals ?? "General Knowledge"}

                      EXISTING CATEGORIES:
                      [{cats}]

                      RESOURCE TO ARCHIVE:
                      Title: {resource.Title}
                      Url: {resource.Url}
                      Content: {content ?? "N/A"}
                      """;

    return (systemPrompt, userPrompt);
}
    private class InboxJsonResult
    {
        public string? CorrectedTitle { get; set; }
        public int Score { get; set; }
        public string? Verdict { get; set; }
        public string? Summary { get; set; }
        public string[]? SuggestedTags { get; set; }
    }

    private class VaultJsonResult
    {
        public string? CorrectedTitle { get; set; }
        public string? Summary { get; set; }
        public string[]? SuggestedTags { get; set; }
        public string? SuggestedCategoryName { get; set; }
    }
}