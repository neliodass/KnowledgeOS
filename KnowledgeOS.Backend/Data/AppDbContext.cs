using KnowledgeOS.Backend.Entities.Resources;
using KnowledgeOS.Backend.Entities.Resources.ConcreteResources;
using KnowledgeOS.Backend.Entities.Tagging;
using KnowledgeOS.Backend.Entities.Users;
using KnowledgeOS.Backend.Services.Abstractions;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace KnowledgeOS.Backend.Data;

public class AppDbContext : IdentityDbContext<ApplicationUser>
{
    private readonly ICurrentUserService _currentUserService;

    public AppDbContext(
        DbContextOptions<AppDbContext> options,
        ICurrentUserService currentUserService) : base(options)
    {
        _currentUserService = currentUserService;
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

    //Users stuff
    public DbSet<UserPreference> UserPreferences { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.Entity<Resource>().UseTptMappingStrategy();
        modelBuilder.Entity<Resource>()
            .HasMany(r => r.Tags)
            .WithMany(t => t.Resources);
        modelBuilder.Entity<Resource>()
            .HasOne(r => r.Category)
            .WithMany(c => c.Resources)
            .HasForeignKey(r => r.CategoryId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<Resource>()
            .HasQueryFilter(r => r.UserId == _currentUserService.UserId);
        modelBuilder.Entity<Category>()
            .HasQueryFilter(c => c.UserId == _currentUserService.UserId);
        modelBuilder.Entity<Tag>()
            .HasQueryFilter(t => t.Resources.Any(r => r.UserId == _currentUserService.UserId));

        modelBuilder.Entity<Category>()
            .HasIndex(c => new { c.Name, c.UserId })
            .IsUnique();

        modelBuilder.Entity<Tag>()
            .HasIndex(t => new { t.Name, t.UserId })
            .IsUnique();

        modelBuilder.Entity<UserPreference>()
            .HasIndex(up => up.UserId)
            .IsUnique();
    }
}