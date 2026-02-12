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

    // Resource Metadata
    public DbSet<InboxMetadata> InboxMetadata { get; set; }
    public DbSet<VaultMetadata> VaultMetadata { get; set; }

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
            .HasOne(r => r.InboxMeta)
            .WithOne(m => m.Resource)
            .HasForeignKey<InboxMetadata>(m => m.ResourceId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<InboxMetadata>().ToTable("ResourceInboxDetails");

        modelBuilder.Entity<Resource>()
            .HasOne(r => r.VaultMeta)
            .WithOne(m => m.Resource)
            .HasForeignKey<VaultMetadata>(m => m.ResourceId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<VaultMetadata>()
            .HasOne(v => v.Category)
            .WithMany(c => c.Resources)
            .HasForeignKey(v => v.CategoryId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<VaultMetadata>().ToTable("ResourceVaultDetails");

        modelBuilder.Entity<Resource>()
            .HasQueryFilter(r => r.UserId == _currentUserService.UserId);
        
        modelBuilder.Entity<InboxMetadata>()
            .HasQueryFilter(m => m.Resource.UserId == _currentUserService.UserId);

        modelBuilder.Entity<VaultMetadata>()
            .HasQueryFilter(m => m.Resource.UserId == _currentUserService.UserId);
        
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