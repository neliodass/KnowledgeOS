using Hangfire;
using Hangfire.PostgreSql;
using KnowledgeOS.Backend.Jobs.Abstractions;

namespace KnowledgeOS.Backend.Extensions;

public static class HangfireExtensions
{
    public static IServiceCollection AddHangfireConfig(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
                               ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

        services.AddHangfire(config =>
            config.SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
                .UseSimpleAssemblyNameTypeSerializer()
                .UseRecommendedSerializerSettings()
                .UsePostgreSqlStorage(options =>
                    options.UseNpgsqlConnection(connectionString)));

        services.AddHangfireServer();

        return services;
    }

    public static WebApplication ScheduleRecurringJobs(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var recurringJobManager = scope.ServiceProvider.GetRequiredService<IRecurringJobManager>();
        recurringJobManager.AddOrUpdate<IErrorRecoveryJob>(
            "system-error-recovery",
            job => job.RecoverAsync(),
            Cron.Hourly
        );

        return app;
    }
}

