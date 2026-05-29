using System.Security.Claims;
using KnowledgeOS.Backend.Services.Abstractions;

namespace KnowledgeOS.Backend.Services;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public string? UserId => _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);

    public bool HasPermission(string permissionName)
    {
        return _httpContextAccessor.HttpContext?.User?.HasClaim(ClaimTypes.Name, permissionName) ?? false;
    }
}