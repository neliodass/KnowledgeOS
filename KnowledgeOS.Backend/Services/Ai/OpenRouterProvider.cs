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

    public async Task<InboxAnalysisResult> AnalyzeForInboxAsync(Resource resource, string userPreferences,
        string? extraContext = null)
    {
        var options = BuildInboxOptions();
        var prompt = BuildInboxPrompt(resource, userPreferences, extraContext);

        var content = await CallAiWithRetryAsync(prompt, options);
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

    public async Task<VaultAnalysisResult> AnalyzeForVaultAsync(Resource resource, string userPreferences,
        List<string> existingCategories, string? extraContext = null)
    {
        var options = BuildVaultOptions();
        var prompt = BuildVaultPrompt(resource, userPreferences, existingCategories, extraContext);
        var content = await CallAiWithRetryAsync(prompt, options);
        var result = JsonSerializer.Deserialize<VaultJsonResult>(content,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        return new VaultAnalysisResult(
            result?.CorrectedTitle ?? resource.Title,
            result?.Summary ?? "No summary.",
            result?.SuggestedTags ?? Array.Empty<string>(),
            result?.SuggestedCategoryName ?? "General"
        );
    }

    private async Task<string> CallAiWithRetryAsync(string prompt, ChatCompletionOptions options)
    {
        var chatClient = _openAiClient.GetChatClient(_modelId);
        var messages = new List<ChatMessage>
        {
            new SystemChatMessage(
                "You are a professional knowledge curator assistant. You are a strict JSON API. You output ONLY valid JSON. No markdown, no conversational filler."),
            new UserChatMessage(prompt)
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
                        summary = new { type = "string", description = "Summarize whole content in around 6-8 sentences" },
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

private string BuildInboxPrompt(Resource resource, string prefs, string? content)
    {
        return $"""
                TASK: NUANCED CONTENT CURATION
                You are a personal curator. Your goal is to distinguish between **SOULLESS NOISE** (Brainrot, Grifters) and **HUMAN PASSION** (Hobbies, Art, Stories, Skills).

                USER PROFILE (Context & Preferences):
                {prefs}

                RESOURCE METADATA:
                Title: {resource.Title}
                Url: {resource.Url}
                Content Snippet: {content ?? "N/A"}

                --- CORE EVALUATION LOGIC (EXECUTE IN ORDER) ---

                1. **THE "PASSION & HOBBY" WHITELIST (ABSOLUTE PRIORITY):**
                   - **Action:** Check User Hobbies. Does this content fit a specific listed interest?
                   - **CRITICAL OVERRIDE:** If the content matches a Hobby (e.g., RPG, History, obscure sport), you must **IGNORE** standard "quality" metrics.
                     - **"Amateur Production"?** -> ACCEPTABLE. Indie creators are the heart of hobbies.
                     - **"Fiction/Drama"?** -> ACCEPTABLE. Narrative is key for RPG/Lore fans.
                     - **"Passive Listening"?** -> ACCEPTABLE. Audio dramas/sessions are valid content.
                   - *Result:* If matches hobby -> **SCORE 90-100**. Verdict: "Core Hobby Match".

                2. **THE "UNIQUE EXPERIENCE & MASTERY" CHECK (DISCOVERY):**
                   - *Only if Step 1 failed.*
                   - Does the content show a **Unique Human Experience**, **Skill**, or **Complex Process**?
                   - *Examples:*
                     - **Athletics:** Training for Olympics / Bobsleigh (High Discipline).
                     - **Crafts:** Repairing electronics, painting, cooking.
                     - **Analysis:** Deep dive into a niche topic (e.g., history of cement).
                   - *Result:* If it shows effort/skill -> **SCORE 70-85**. Verdict: "High-Value Discovery".

                3. **THE "BS" & BRAINROT FILTER (THE TRASH CAN):**
                   - *Only if Step 1 & 2 failed.*
                   - **Pseudo-Intellectualism:** Using big words to say nothing (e.g., "Quantum AI Soul"). note: Fiction/RPG is NOT pseudo-intellectualism.
                   - **The "Reactor" Trap:** Streamers watching other videos with zero expert input (just laughing/"wow").
                   - **Delusions:** Grandiose claims without proof.
                   - **Result:** **SCORE 0-20**. Verdict: "Noise/Low Effort".

                4. **THE "PROFESSIONAL" CHECK:**
                   - Valid educational material for career? -> **Score 90-100**.

                --- SCORING GUIDE ---
                - **90-100:** Core Hobby (RPG/Lore/Story) OR Professional Goal.
                - **70-89:** High-Effort Discovery (Unique Skills, Athletics, Crafts, Deep Dives).
                - **40-69:** Standard entertainment / News.
                - **0-39:** Grifters, Pseudo-science, Lazy Reaction Videos, Drama.

                --- OUTPUT INSTRUCTIONS ---
                - **CorrectedTitle:** Descriptive.
                - **Verdict:**
                  - If Hobby: "Protected Hobby Content: Matches [Interest]."
                  - If Discovery: "High-value demonstration of [Skill/Experience]."
                  - If Noise: "Rejected: Low-effort/Pseudo-intellectual."
                """;
    }
    private string BuildVaultPrompt(Resource resource, string prefs, List<string> categories, string? content)
    {
        var cats = categories.Any() ? string.Join(", ", categories) : "None (Propose a new one)";

        return $"""
                TASK: VAULT ARCHIVING
                Organize this resource for the Knowledge Vault.

                USER CONTEXT:
                {prefs}

                EXISTING CATEGORIES:
                [{cats}]

                RESOURCE DATA:
                Title: {resource.Title}
                Url: {resource.Url}
                Content: {content ?? "N/A"}

                INSTRUCTIONS:
                1. CATEGORY: Check "EXISTING CATEGORIES". If the content fits quite well, use that name EXACTLY. If totally not, suggest a new, concise name.
                2. TITLE: Create a searchable Corrected Title.
                3. SUMMARY: Detailed insights.
                4. TAGS: 3-5 tags.
                """;
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