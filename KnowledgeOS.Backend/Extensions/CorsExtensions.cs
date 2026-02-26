namespace KnowledgeOS.Backend.Extensions;

public static class CorsExtensions
{
    public static IServiceCollection AddCorsConfig(this IServiceCollection services)
    {
        services.AddCors(options =>
        {
            options.AddPolicy("AllowNextJs",
                policy =>
                {
                    policy.WithOrigins("http://localhost:3000")
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
        app.UseCors(environment.IsDevelopment() ? "AllowAllDev" : "AllowNextJs");

        return app;
    }
}

