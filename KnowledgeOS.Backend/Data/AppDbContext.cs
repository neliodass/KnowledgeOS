using KnowledgeOS.Backend.Entities.Resources;
using KnowledgeOS.Backend.Entities.Resources.ConcreteResources;
using Microsoft.EntityFrameworkCore;

namespace KnowledgeOS.Backend.Data;

public class AppDbContext:DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }
    // DbSets
    
    //Resources
    public DbSet<Resource> Resources { get; set; }
    // Concrete Resources
    public DbSet<VideoResource> Videos { get; set; }
    public DbSet<ArticleResource> Articles { get; set; }
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Resource>().UseTptMappingStrategy();

        base.OnModelCreating(modelBuilder);
    }
}