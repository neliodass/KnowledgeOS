using KnowledgeOS.Backend.DTOs.Auth;
using Microsoft.AspNetCore.Identity;

namespace KnowledgeOS.Backend.Services.Abstractions;

public interface IIdentityService
{
    Task<IdentityResult> RegisterAsync(RegisterDto dto);
    Task<string?> LoginAsync(LoginDto dto);
    Task<string?> GetDisplayNameAsync(string userId);
    Task<IdentityResult> ChangePasswordAsync(string userId, ChangePasswordDto dto);
    Task<IdentityResult> ChangeDisplayNameAsync(string userId, ChangeDisplayNameDto dto);
}