using KnowledgeOS.Backend.DTOs.Auth;
using Microsoft.AspNetCore.Identity;

namespace KnowledgeOS.Backend.Services.Abstractions;

public interface IIdentityService
{
    Task<IdentityResult> RegisterAsync(RegisterDto dto);
    Task<string?> LoginAsync(LoginDto dto);
}