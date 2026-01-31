using System.ComponentModel.DataAnnotations;
using KnowledgeOS.Backend.Entities.Abstractions;

namespace KnowledgeOS.Backend.Entities.Users;

public class UserPreference : IUserOwnedResource
{
    [Key] public Guid Id { get; set; }
    [Required] public string UserId { get; set; } = string.Empty;
    public ApplicationUser? User { get; set; }

    // "Kim jestem / Co robię" (np. "Programista .NET, interesuję się architekturą")
    [MaxLength(1000)] public string? ProfessionalContext { get; set; }

    // "Co jest dla mnie ważne" (np. "Tutoriale, Deep Dive, Newsy technologiczne")
    [MaxLength(1000)] public string? LearningGoals { get; set; }

    // "Czego unikać" (np. "Polityka, Clickbait, Filmy powyżej 1h bez spisu treści")
    [MaxLength(1000)] public string? TopicsToAvoid { get; set; }

    public string ToAiPromptContext()
    {
        return $"""
                MY CONTEXT: {ProfessionalContext ?? "General Audience"}
                INTERESTS/GOALS: {LearningGoals ?? "General Knowledge"}
                AVOID: {TopicsToAvoid ?? "Nothing specific"}
                """;
    }
}