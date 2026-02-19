using KnowledgeOS.Backend.DTOs.Users;

namespace KnowledgeOS.Backend.Services.Abstractions;

public interface IUserPreferencesService
{
    Task<UserPreferenceDto> GetPreferencesAsync(string userId);
    Task UpdatePreferencesAsync(string userId, UserPreferenceDto dto);
}