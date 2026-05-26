using System.Diagnostics;
using System.Text.Json;
using KnowledgeOS.Backend.Entities.Resources;
using KnowledgeOS.Backend.Entities.Users;
using KnowledgeOS.Backend.Services.Ai.Abstractions;
using KnowledgeOS.Backend.Services.Ai.Prompts;
using KnowledgeOS.Backend.Services.Ai.Embeddings;
using KnowledgeOS.Backend.Services.Ai.Scoring;
using OpenAI;
using OpenAI.Chat;

namespace KnowledgeOS.Backend.Services.Ai;

public class OpenRouterProvider : IAiProvider
{
    private readonly OpenAIClient _openAiClient;
    private readonly string _modelId;
    private readonly RelevanceEmbeddingMatcher _relevanceEmbeddingMatcher;
    private readonly ILogger<OpenRouterProvider> _logger;

    public string Name => $"OpenRouter ({_modelId})";

    public OpenRouterProvider(
        OpenAIClient openAiClient,
        string modelId,
        RelevanceEmbeddingMatcher relevanceEmbeddingMatcher,
        ILogger<OpenRouterProvider> logger)
    {
        _openAiClient = openAiClient;
        _modelId = modelId;
        _relevanceEmbeddingMatcher = relevanceEmbeddingMatcher;
        _logger = logger;
    }

    public async Task<InboxAnalysisResult> AnalyzeForInboxAsync(Resource resource, UserPreference? userPreferences,
        string? extraContext = null)
    {
        var hasSnippet = !string.IsNullOrWhiteSpace(extraContext);
        var embeddingHint = await _relevanceEmbeddingMatcher.TryMatchAsync(
            userPreferences, resource, extraContext);

        var options = BuildInboxOptions();
        var (systemPrompt, userPrompt) =
            InboxScoringPromptBuilder.Build(resource, userPreferences, extraContext, embeddingHint);

        var content = await CallAiWithRetryAsync(systemPrompt, userPrompt, options);
        var dto = AiAnalysisResponseParser.ParseInbox(content);

        if (embeddingHint != null)
            dto.Relevance = RelevanceTierHarmonizer.HarmonizeLlmRelevance(dto.Relevance, embeddingHint);

        var tiers = dto.ToTiers(hasSnippet);
        var sortPriority = InboxSortPriority.Compute(tiers);

        _logger.LogInformation(
            "Inbox scoring {ResourceId} model={Model}: substance={Substance} intent={Intent} relevance={Relevance} avoidance={Avoidance} sort={Sort} metadataOnly={MetadataOnly} embedSim={EmbedSim}",
            resource.Id, _modelId, tiers.SubstanceDepth, tiers.ContentIntent, tiers.Relevance,
            tiers.MatchesAvoidance, sortPriority, tiers.ScoredFromMetadataOnly, embeddingHint?.Similarity);

        return new InboxAnalysisResult(
            dto.CorrectedTitle!,
            dto.Verdict!,
            dto.Summary!,
            dto.SuggestedTags!,
            tiers,
            dto.Takeaway ?? string.Empty,
            sortPriority,
            tiers.ScoredFromMetadataOnly);
    }

    public async Task<VaultAnalysisResult> AnalyzeForVaultAsync(Resource resource, UserPreference? userPreferences,
        List<string> existingCategories, string? extraContext = null)
    {
        var options = BuildVaultOptions(existingCategories);
        var (systemPrompt, userPrompt) =
            VaultArchivingPromptBuilder.Build(resource, userPreferences, existingCategories, extraContext);

        var content = await CallAiWithRetryAsync(systemPrompt, userPrompt, options);
        var dto = AiAnalysisResponseParser.ParseVault(content);

        return new VaultAnalysisResult(
            dto.CorrectedTitle!,
            dto.Summary!,
            dto.SuggestedTags!,
            dto.ResolveCategoryName());
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
                _logger.LogWarning("Attempt {Attempt} failed for model {Model}: {Message}", attempt, _modelId,
                    ex.Message);
                if (attempt == 2) throw;
                await Task.Delay(1000);
            }

        throw new UnreachableException();
    }

    private static ChatCompletionOptions BuildInboxOptions()
    {
        return new ChatCompletionOptions
        {
            Temperature = 0.2f,
            ResponseFormat = ChatResponseFormat.CreateJsonSchemaFormat(
                "inbox_analysis",
                BinaryData.FromObjectAsJson(new
                {
                    type = "object",
                    properties = new
                    {
                        correctedTitle = new { type = "string" },
                        substanceDepth = new
                        {
                            type = "string",
                            @enum = new[] { "deep", "moderate", "shallow", "insufficient_data" }
                        },
                        contentIntent = new
                        {
                            type = "string",
                            @enum = new[] { "learn", "entertain", "inspire", "news", "mixed" }
                        },
                        relevance = new
                        {
                            type = "string",
                            @enum = new[] { "professional", "hobby", "discovery", "standard", "none" }
                        },
                        matchesAvoidance = new { type = "boolean" },
                        takeaway = new
                        {
                            type = "string",
                            description = "One short Polish hook line, max 80 characters."
                        },
                        verdict = new { type = "string", description = "Two sentences, max 500 characters." },
                        summary = new
                        {
                            type = "string",
                            description = "6-8 sentences about the content only."
                        },
                        suggestedTags = new
                        {
                            type = "array",
                            items = new { type = "string" },
                            minItems = 3,
                            maxItems = 8
                        }
                    },
                    required = new[]
                    {
                        "correctedTitle", "substanceDepth", "contentIntent", "relevance", "matchesAvoidance",
                        "takeaway", "verdict", "summary", "suggestedTags"
                    },
                    additionalProperties = false
                }, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase }),
                jsonSchemaIsStrict: true)
        };
    }

    private static ChatCompletionOptions BuildVaultOptions(List<string> existingCategories)
    {
        var categoryEnum = existingCategories
            .Where(c => !string.IsNullOrWhiteSpace(c))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();
        categoryEnum.Add(VaultArchivingPromptBuilder.NewCategoryToken);

        return new ChatCompletionOptions
        {
            Temperature = 0.2f,
            ResponseFormat = ChatResponseFormat.CreateJsonSchemaFormat(
                "vault_analysis",
                BinaryData.FromObjectAsJson(new
                {
                    type = "object",
                    properties = new
                    {
                        correctedTitle = new { type = "string" },
                        summary = new { type = "string" },
                        suggestedTags = new
                        {
                            type = "array",
                            items = new { type = "string" },
                            minItems = 3,
                            maxItems = 8
                        },
                        categoryChoice = new
                        {
                            type = "string",
                            description = "One value from categoryChoices.",
                            @enum = categoryEnum
                        },
                        newCategoryName = new
                        {
                            type = "string",
                            description = "Required when categoryChoice is __NEW__."
                        }
                    },
                    required = new[] { "correctedTitle", "summary", "suggestedTags", "categoryChoice" },
                    additionalProperties = false
                }, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase }),
                jsonSchemaIsStrict: true)
        };
    }
}
