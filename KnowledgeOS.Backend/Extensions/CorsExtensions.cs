namespace KnowledgeOS.Backend.Extensions;

public static class CorsExtensions
{
    public static IServiceCollection AddCorsConfig(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddCors(options =>
        {
            options.AddPolicy("AllowConfigured",
                policy =>
                {
                    policy.SetIsOriginAllowed(_ => true)
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .AllowCredentials();
                });

            options.AddPolicy("AllowAllDev",
                policy =>
                {
                    policy.AllowAnyOrigin()
                        .AllowAnyHeader()
                        .AllowAnyMethod();
                });
        });

        return services;
    }

    public static WebApplication UseCorsConfig(this WebApplication app, IWebHostEnvironment environment)
    {
        app.UseCors(environment.IsDevelopment() ? "AllowAllDev" : "AllowConfigured");

        return app;
    }
}