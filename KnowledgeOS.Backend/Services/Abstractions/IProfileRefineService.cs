using KnowledgeOS.Backend.DTOs.Users;

namespace KnowledgeOS.Backend.Services.Abstractions;

public interface IProfileRefineService
{
    Task<ProfileRefineResponseDto> RefineAsync(
        string userId,
        string message,
        Guid? resourceId = null,
        CancellationToken cancellationToken = default);
}
