namespace KnowledgeOS.Backend.DTOs.Resources;

public class CategoryDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int ResourceCount { get; set; }
}