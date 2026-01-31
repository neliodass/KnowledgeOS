using KnowledgeOS.Backend.Data;
using KnowledgeOS.Backend.DTOs.Users;
using KnowledgeOS.Backend.Entities.Users;
using KnowledgeOS.Backend.Services.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace KnowledgeOS.Backend.Services;

public class UserPreferencesService: IUserPreferencesService
{
    private readonly AppDbContext _context;

    public UserPreferencesService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<UserPreferenceDto> GetPreferencesAsync(string userId)
    {
        var prefs = await _context.UserPreferences
            .FirstOrDefaultAsync(p => p.UserId == userId);
        if (prefs == null) return new UserPreferenceDto();

        return new UserPreferenceDto
        {
            ProfessionalContext = prefs.ProfessionalContext,
            LearningGoals = prefs.LearningGoals,
            TopicsToAvoid = prefs.TopicsToAvoid
        };
    }

    public async Task UpdatePreferencesAsync(string userId, UserPreferenceDto dto)
    {
        var prefs = await _context.UserPreferences
            .FirstOrDefaultAsync(p => p.UserId == userId);

        if (prefs == null)
        {
            prefs = new UserPreference
            {
                UserId = userId,
                ProfessionalContext = dto.ProfessionalContext,
                LearningGoals = dto.LearningGoals,
                TopicsToAvoid = dto.TopicsToAvoid
            };
            _context.UserPreferences.Add(prefs);
        }
        else
        {
            prefs.ProfessionalContext = dto.ProfessionalContext;
            prefs.LearningGoals = dto.LearningGoals;
            prefs.TopicsToAvoid = dto.TopicsToAvoid;
        }

        await _context.SaveChangesAsync();
    }
}