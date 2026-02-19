using System.ComponentModel.DataAnnotations;
using KnowledgeOS.Backend.Entities.Resources;

namespace KnowledgeOS.Backend.DTOs.Resources;

public class UpdateResourceStatusDto
{
    [Required]
    [EnumDataType(typeof(ResourceStatus))]
    public ResourceStatus Status { get; set; }
}