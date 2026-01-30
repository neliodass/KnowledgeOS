using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using KnowledgeOS.Backend.Entities.Resources;

namespace KnowledgeOS.Backend.Entities.Tagging;

public class Category
{
    [Key]
    public Guid Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty; // np. "Programming"
    
    [JsonIgnore]
    public ICollection<Resource> Resources { get; set; } = new List<Resource>();
}