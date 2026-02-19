namespace KnowledgeOS.Backend.DTOs.Users;

public class UserPreferenceDto
{
    // "Kim jestem / Co robię" (np. "Programista .NET, interesuję się architekturą")
    public string? ProfessionalContext { get; set; }

    // "Co jest dla mnie ważne" (np. "Tutoriale, Deep Dive, Newsy technologiczne")
    public string? LearningGoals { get; set; }
    //"Co jest moim hobby" (np. "Gotowanie, podróże, historia starożytna") - opcjonalnie, może pomóc w lepszym dopasowaniu treści
    public string? Hobbies { get; set; }

    // "Czego unikać" (np. "Polityka, Clickbait, Filmy powyżej 1h bez spisu treści")
    public string? TopicsToAvoid { get; set; }
}