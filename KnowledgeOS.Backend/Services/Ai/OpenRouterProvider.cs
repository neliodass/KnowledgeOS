using System.Diagnostics;
using System.Text.Json;
using KnowledgeOS.Backend.Entities.Resources;
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

    public async Task<AiAnalysisResult> AnalyzeAsync(Resource resource, string userPreferences,
        string? extraContext = null)
    {
        var chatClient = _openAiClient.GetChatClient(_modelId);

        var prompt = BuildPrompt(resource, userPreferences, extraContext);

        const int MaxRetries = 2;
        var delay = TimeSpan.FromSeconds(1);

        var messages = new List<ChatMessage>
        {
            new SystemChatMessage(
                "You are a personal knowledge curator assistant. You are a strict JSON API. You output ONLY valid JSON. No markdown, no intro, no explanation."),
            new UserChatMessage(prompt)
        };

        var options = new ChatCompletionOptions
        {
            ResponseFormat = ChatResponseFormat.CreateJsonSchemaFormat(
                jsonSchemaFormatName: "resource_analysis",
                jsonSchema: BinaryData.FromObjectAsJson(new
                {
                    type = "object",
                    properties = new
                    {
                        correctedTitle = new
                        {
                            type = "string",
                            description = "Improved title for the resource."
                        },
                        score = new
                        {
                            type = "integer",
                            description = "Relevance score from 0 to 100 based on user preferences."
                        },
                        verdict = new
                        {
                            type = "string",
                            description = "Short explanation of the score."
                        },
                        summary = new
                        {
                            type = "string",
                            description = "Concise summary of the content (max 3 sentences)."
                        },
                        suggestedTags = new
                        {
                            type = "array",
                            items = new { type = "string" },
                            description = "List of 3-5 relevant tags for categorization."
                        }
                    },
                    required = new[] { "score", "verdict", "summary", "suggestedTags" },
                    additionalProperties = false
                }),
                jsonSchemaIsStrict: true
            )
        };
        for (int attempt = 1; attempt <= MaxRetries; attempt++)
        {
            try
            {
                ChatCompletion completion = await chatClient.CompleteChatAsync(messages, options);
                var content = completion.Content[0].Text;

                if (string.IsNullOrEmpty(content))
                {
                    _logger.LogWarning(
                        $"Model {_modelId} returned empty content on attempt {attempt}. Skipping internal retries.");
                    throw new InvalidOperationException("AI returned empty content.");
                }

                _logger.LogInformation($"Analyzing {resource.Id}: {content}");
                var result = JsonSerializer.Deserialize<AiJsonResult>(content, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                return new AiAnalysisResult(
                    result?.CorrectedTitle ?? "No corrected title",
                    result?.Score ?? 0,
                    result?.Verdict ?? "No verdict",
                    result?.Summary ?? "No summary",
                    result?.SuggestedTags ?? Array.Empty<string>()
                );
            }
            catch (JsonException jsonEx)
            {
                _logger.LogWarning($"JSON Parse Error (Attempt {attempt}) for {_modelId}: {jsonEx.Message}");

                if (attempt == MaxRetries) throw;
                await Task.Delay(delay);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error using AI model {_modelId}");
                throw;
            }
        }

        throw new UnreachableException();
    }

    private string BuildPrompt(Resource resource, string userPreferences, string? extraContext)
    {
        return $$$"""
                  Analyze the following content:

                  Metadata:
                  Title: {{{resource.Title}}}
                  URL: {{{resource.Url}}}
                  Description: {{{resource.Description ?? "N/A"}}}
                  Content: {{{extraContext ?? "N/A"}}}

                  User Preferences:
                  {{{userPreferences}}}

                  Task:
                  Evaluate according to User preferences. Give relevance, provide a verdict (number 1-100), provide corrected title, summarize, and tag according to the schema.


                  REQUIRED JSON OUTPUT:
                  {{
                    "correctedTitle": "Better Title",
                    "score": 85,
                    "verdict": "Why relevant or not in short...",
                    "summary": "What is it...",
                    "suggestedTags": ["tag1", "tag2"]
                  }}
                  """;
    }

    private class AiJsonResult
    {
        public string? CorrectedTitle { get; set; } = string.Empty;
        public int Score { get; set; }
        public string? Verdict { get; set; }
        public string? Summary { get; set; }
        public string[]? SuggestedTags { get; set; }
    }
}