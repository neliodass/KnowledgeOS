namespace KnowledgeOS.Backend.Extensions;

public static class CorsExtensions
{
    public static IServiceCollection AddCorsConfig(this IServiceCollection services, IConfiguration configuration)
    {
        var allowedOrigins = configuration["Cors:AllowedOrigins"]
            ?.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            ?? ["http://localhost:3000", "moz-extension://0cb7157b-42b2-4ace-b78f-3903cbcbd6fc", "chrome-extension://iplilhnkllipnldlphdmhglmkpfmloep"];

        services.AddCors(options =>
        {
            options.AddPolicy("AllowConfigured",
                policy =>
                {
                    policy.WithOrigins(allowedOrigins)
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

