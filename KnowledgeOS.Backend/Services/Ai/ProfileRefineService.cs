using System.Text.Json;
using KnowledgeOS.Backend.DTOs.Users;
using KnowledgeOS.Backend.Services.Abstractions;
using KnowledgeOS.Backend.Services.Ai.Prompts;
using OpenAI;
using OpenAI.Chat;

namespace KnowledgeOS.Backend.Services.Ai;

public class ProfileRefineService : IProfileRefineService
{
    private readonly OpenAIClient _openAiClient;
    private readonly string _modelId;
    private readonly IUserPreferencesService _preferencesService;
    private readonly ILogger<ProfileRefineService> _logger;

    public ProfileRefineService(
        OpenAIClient openAiClient,
        IConfiguration configuration,
        IUserPreferencesService preferencesService,
        ILogger<ProfileRefineService> logger)
    {
        _openAiClient = openAiClient;
        _preferencesService = preferencesService;
        _logger = logger;
        _modelId = configuration["Ai:Model_1"]
                   ?? configuration.GetSection("Ai").GetChildren()
                       .FirstOrDefault(c => c.Key.StartsWith("Model_", StringComparison.Ordinal))?.Value
                   ?? throw new InvalidOperationException("No AI model configured for profile refine (Ai:Model_1).");
    }

    public async Task<ProfileRefineResponseDto> RefineAsync(string userId, string message,
        CancellationToken cancellationToken = default)
    {
        var current = await _preferencesService.GetPreferencesAsync(userId);
        var (systemPrompt, userPrompt) = ProfileRefinePromptBuilder.Build(current, message);
        var options = BuildOptions();

        var raw = await CallAiWithRetryAsync(systemPrompt, userPrompt, options, cancellationToken);
        var parsed = ProfileRefineResponseParser.Parse(raw);

        var proposed = new UserPreferenceDto
        {
            ProfessionalContext = parsed.ProfessionalContext,
            LearningGoals = parsed.LearningGoals,
            Hobbies = parsed.Hobbies,
            TopicsToAvoid = parsed.TopicsToAvoid
        };

        var changedFields = ProfileRefineFieldComparer.GetChangedFields(current, proposed);
        var hasChanges = parsed.HasChanges && ProfileRefineFieldComparer.HasChanges(changedFields);

        return new ProfileRefineResponseDto
        {
            AssistantSummary = parsed.AssistantSummary!,
            ProposedPreferences = proposed,
            ChangedFields = changedFields,
            HasChanges = hasChanges
        };
    }

    private async Task<string> CallAiWithRetryAsync(
        string systemPrompt,
        string userPrompt,
        ChatCompletionOptions options,
        CancellationToken cancellationToken)
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
                ChatCompletion completion = await chatClient.CompleteChatAsync(messages, options, cancellationToken);
                var text = completion.Content[0].Text;
                if (string.IsNullOrWhiteSpace(text))
                    throw new InvalidOperationException("Profile refine AI returned empty response.");
                return text;
            }
            catch (Exception ex) when (attempt < 2)
            {
                _logger.LogWarning("Profile refine attempt {Attempt} failed for model {Model}: {Message}", attempt,
                    _modelId, ex.Message);
                await Task.Delay(1000, cancellationToken);
            }

        throw new InvalidOperationException("Profile refine AI failed after retries.");
    }

    private static ChatCompletionOptions BuildOptions()
    {
        return new ChatCompletionOptions
        {
            Temperature = 0.3f,
            ResponseFormat = ChatResponseFormat.CreateJsonSchemaFormat(
                "profile_refine",
                BinaryData.FromObjectAsJson(new
                {
                    type = "object",
                    properties = new
                    {
                        assistantSummary = new { type = "string" },
                        professionalContext = new { type = "string" },
                        learningGoals = new { type = "string" },
                        hobbies = new { type = "string" },
                        topicsToAvoid = new { type = "string" },
                        hasChanges = new { type = "boolean" }
                    },
                    required = new[]
                    {
                        "assistantSummary", "professionalContext", "learningGoals", "hobbies", "topicsToAvoid",
                        "hasChanges"
                    },
                    additionalProperties = false
                }, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase }),
                jsonSchemaIsStrict: true)
        };
    }
}
