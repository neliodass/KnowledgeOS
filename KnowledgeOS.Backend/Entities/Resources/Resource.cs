using System.ComponentModel.DataAnnotations;
using KnowledgeOS.Backend.Entities.Abstractions;
using KnowledgeOS.Backend.Entities.Tagging;
using KnowledgeOS.Backend.Entities.Users;

namespace KnowledgeOS.Backend.Entities.Resources;

public abstract class Resource : IUserOwnedResource
{
    [Key] public Guid Id { get; set; }

    [Required] [MaxLength(2048)] public string Url { get; set; } = string.Empty;
    [MaxLength(500)] public string Title { get; set; } = "Waiting for analysis...";
    [MaxLength(500)] public string? CorrectedTitle { get; set; }
    [MaxLength(2000)] public string? Description { get; set; }
    [MaxLength(2048)] public string? ImageUrl { get; set; }

    public ResourceStatus Status { get; set; } = ResourceStatus.New;

    public ICollection<Tag> Tags { get; set; } = new List<Tag>();

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsVaultTarget { get; set; } = false;

    [Required] public string UserId { get; set; } = string.Empty;
    public ApplicationUser? User { get; set; }

    public InboxMetadata? InboxMeta { get; set; }
    public VaultMetadata? VaultMeta { get; set; }
}