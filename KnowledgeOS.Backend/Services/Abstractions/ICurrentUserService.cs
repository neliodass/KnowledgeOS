namespace KnowledgeOS.Backend.Services.Abstractions;

public interface ICurrentUserService
{
    string? UserId { get; }
}