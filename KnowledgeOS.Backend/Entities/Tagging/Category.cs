using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using KnowledgeOS.Backend.Entities.Abstractions;
using KnowledgeOS.Backend.Entities.Resources;
using KnowledgeOS.Backend.Entities.Users;

namespace KnowledgeOS.Backend.Entities.Tagging;

public class Category :IUserOwnedResource
{
    [Key]
    public Guid Id { get; set; }
    [Required]
    public string UserId { get; set; } = string.Empty;
    public ApplicationUser User { get; set; }

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty; // np. "Programming"
    
    [JsonIgnore]
    public ICollection<Resource> Resources { get; set; } = new List<Resource>();
}