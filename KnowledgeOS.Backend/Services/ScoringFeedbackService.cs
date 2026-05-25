using KnowledgeOS.Backend.Data;
using KnowledgeOS.Backend.DTOs.Feedback;
using KnowledgeOS.Backend.Entities.Feedback;
using KnowledgeOS.Backend.Services.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace KnowledgeOS.Backend.Services;

public class ScoringFeedbackService : IScoringFeedbackService
{
    private readonly AppDbContext _context;

    public ScoringFeedbackService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<ScoringFeedbackResponseDto> CreateAsync(string userId, Guid resourceId, string comment)
    {
        var resource = await _context.Resources
            .Include(r => r.InboxMeta)
            .FirstOrDefaultAsync(r => r.Id == resourceId);

        if (resource == null)
            throw new KeyNotFoundException($"Resource {resourceId} not found.");

        var feedback = new ScoringFeedback
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            ResourceId = resourceId,
            Comment = comment.Trim(),
            AiScoreAtFeedback = resource.InboxMeta?.AiScore,
            AiVerdictAtFeedback = resource.InboxMeta?.AiVerdict,
            CreatedAt = DateTime.UtcNow
        };

        _context.ScoringFeedbacks.Add(feedback);
        await _context.SaveChangesAsync();

        return new ScoringFeedbackResponseDto
        {
            Id = feedback.Id,
            ResourceId = feedback.ResourceId,
            Comment = feedback.Comment,
            AiScoreAtFeedback = feedback.AiScoreAtFeedback,
            CreatedAt = feedback.CreatedAt
        };
    }
}
