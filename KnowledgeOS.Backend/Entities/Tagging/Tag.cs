using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using KnowledgeOS.Backend.Entities.Resources;

namespace KnowledgeOS.Backend.Entities.Tagging;

public class Tag
{
    public Guid Id { get; set; }

    [Required]
    [MaxLength(50)]
    public string Name { get; set; } = string.Empty; 

    [JsonIgnore] 
    public ICollection<Resource> Resources { get; set; } = new List<Resource>();
}