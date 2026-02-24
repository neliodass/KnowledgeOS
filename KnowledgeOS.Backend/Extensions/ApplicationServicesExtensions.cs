using System.ClientModel;
using KnowledgeOS.Backend.Jobs;
using KnowledgeOS.Backend.Jobs.Abstractions;
using KnowledgeOS.Backend.Services;
using KnowledgeOS.Backend.Services.Abstractions;
using KnowledgeOS.Backend.Services.Ai;
using KnowledgeOS.Backend.Services.Ai.Abstractions;
using KnowledgeOS.Backend.Services.Content;
using OpenAI;

namespace KnowledgeOS.Backend.Extensions;

public static class ApplicationServicesExtensions
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddHttpContextAccessor();

        services.AddScoped<IIdentityService, IdentityService>();
        services.AddScoped<ICurrentUserService, CurrentUserService>();
        services.AddScoped<IResourceService, ResourceService>();
        services.AddScoped<IUrlIngestionJob, UrlIngestionJob>();
        services.AddScoped<IAiAnalysisJob, AiAnalysisJob>();
        services.AddScoped<IAiService, AiService>();
        services.AddScoped<IUserPreferencesService, UserPreferencesService>();
        services.AddScoped<IErrorRecoveryJob, ErrorRecoveryJob>();
        services.AddScoped<ICategoryService, CategoryService>();

        services.AddScoped<IContentFetcher, YouTubeContentFetcher>();
        services.AddScoped<IContentFetcher, WebsiteContentFetcher>();

        services.AddScoped<OpenAIClient>(sp =>
        {
            var config = sp.GetRequiredService<IConfiguration>();
            var apiKey = config["Ai:OpenRouterKey"]!;
            if (string.IsNullOrEmpty(apiKey))
                throw new InvalidOperationException("OpenRouter API key is not configured.");

            var openRouterOptions = new OpenAIClientOptions
            {
                Endpoint = new Uri("https://openrouter.ai/api/v1")
            };
            return new OpenAIClient(new ApiKeyCredential(apiKey), openRouterOptions);
        });

        var aiModels = configuration.GetSection("Ai");
        foreach (var model in aiModels.GetChildren())
        {
            var modelId = model.Value!;
            services.AddScoped<IAiProvider>(sp =>
            {
                var client = sp.GetRequiredService<OpenAIClient>();
                var logger = sp.GetRequiredService<ILogger<OpenRouterProvider>>();
                return new OpenRouterProvider(client, modelId, logger);
            });
        }

        return services;
    }
}

