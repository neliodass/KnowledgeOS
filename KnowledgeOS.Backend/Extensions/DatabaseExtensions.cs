using KnowledgeOS.Backend.Data;
using Microsoft.EntityFrameworkCore;
using Pgvector;

namespace KnowledgeOS.Backend.Extensions;

public static class DatabaseExtensions
{
    public const int DefaultEmbeddingDimensions = 1536;

    public static IServiceCollection AddDatabase(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
                               ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

        var dimensions = configuration.GetValue("Ai:EmbeddingDimensions", DefaultEmbeddingDimensions);

        services.AddDbContext<AppDbContext>(options => options.UseNpgsql(connectionString, o =>
        {
            o.UseVector();
            o.MigrationsHistoryTable("__EFMigrationsHistory");
        }));

        services.AddSingleton(new EmbeddingOptions(dimensions));

        return services;
    }
}

public record EmbeddingOptions(int Dimensions);

