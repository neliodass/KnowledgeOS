using KnowledgeOS.Backend.DTOs.Feedback;

namespace KnowledgeOS.Backend.Services.Abstractions;

public interface IScoringFeedbackService
{
    Task<ScoringFeedbackResponseDto> CreateAsync(string userId, Guid resourceId, string comment);
}
