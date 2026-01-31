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

        try
        {
            ChatCompletion completion = await chatClient.CompleteChatAsync(messages, options);
            var content = completion.Content[0].Text;

            if (string.IsNullOrEmpty(content))
            {
                return new AiAnalysisResult(0, "Error", "No content", Array.Empty<string>());
            }

            _logger.LogInformation($"Analyzing {resource.Id}: {content}");
            var result = JsonSerializer.Deserialize<AiJsonResult>(content, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            return new AiAnalysisResult(
                result?.Score ?? 0,
                result?.Verdict ?? "No verdict",
                result?.Summary ?? "No summary",
                result?.SuggestedTags ?? Array.Empty<string>()
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error using AI model {_modelId}");
            throw;
        }
    }

    private string BuildPrompt(Resource resource, string userPreferences, string? extraContext)
    {
        return $"""
                Analyze the following content:

                Metadata:
                Title: {resource.Title}
                URL: {resource.Url}
                Description: {resource.Description ?? "N/A"}
                Content: {extraContext ?? "N/A"}

                User Preferences:
                {userPreferences}

                Task:
                Evaluate relevance, provide a verdict (1-100), summarize, and tag according to the schema.
                """;
    }

    private class AiJsonResult
    {
        public int Score { get; set; }
        public string? Verdict { get; set; }
        public string? Summary { get; set; }
        public string[]? SuggestedTags { get; set; }
    }
}