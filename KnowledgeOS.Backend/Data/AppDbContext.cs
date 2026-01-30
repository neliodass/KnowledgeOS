using KnowledgeOS.Backend.Entities.Resources;
using KnowledgeOS.Backend.Entities.Resources.ConcreteResources;
using KnowledgeOS.Backend.Entities.Tagging;
using Microsoft.EntityFrameworkCore;

namespace KnowledgeOS.Backend.Data;

public class AppDbContext : DbContext
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

    // Tags and Categories
    public DbSet<Tag> Tags { get; set; }
    public DbSet<Category> Categories { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Resource>().UseTptMappingStrategy();
        modelBuilder.Entity<Resource>()
            .HasMany(r => r.Tags)
            .WithMany(t => t.Resources);
        modelBuilder.Entity<Resource>()
            .HasOne(r => r.Category)
            .WithMany(c => c.Resources)
            .HasForeignKey(r => r.CategoryId)
            .OnDelete(DeleteBehavior.SetNull);
        modelBuilder.Entity<Category>().HasIndex(c => c.Name).IsUnique();
        modelBuilder.Entity<Tag>().HasIndex(t => t.Name).IsUnique();
        base.OnModelCreating(modelBuilder);
    }
}