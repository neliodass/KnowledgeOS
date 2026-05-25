using KnowledgeOS.Backend.Data;
using KnowledgeOS.Backend.DTOs.Users;
using KnowledgeOS.Backend.Entities.Users;
using KnowledgeOS.Backend.Services.Abstractions;
using KnowledgeOS.Backend.Services.Ai.Embeddings;
using Microsoft.EntityFrameworkCore;

namespace KnowledgeOS.Backend.Services;

public class UserPreferencesService : IUserPreferencesService
{
    private readonly AppDbContext _context;
    private readonly IProfileEmbeddingSyncService _profileEmbeddingSync;

    public UserPreferencesService(AppDbContext context, IProfileEmbeddingSyncService profileEmbeddingSync)
    {
        _context = context;
        _profileEmbeddingSync = profileEmbeddingSync;
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
            Hobbies = prefs.Hobbies,
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
                Hobbies = dto.Hobbies,
                TopicsToAvoid = dto.TopicsToAvoid
            };
            _context.UserPreferences.Add(prefs);
        }
        else
        {
            prefs.ProfessionalContext = dto.ProfessionalContext;
            prefs.LearningGoals = dto.LearningGoals;
            prefs.Hobbies = dto.Hobbies;
            prefs.TopicsToAvoid = dto.TopicsToAvoid;
        }

        await _context.SaveChangesAsync();
        await _profileEmbeddingSync.SyncForUserAsync(userId);
    }
}