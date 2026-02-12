using Microsoft.AspNetCore.Identity;

namespace KnowledgeOS.Backend.Entities.Users;

public class ApplicationUser : IdentityUser
{
    public string? DisplayName { get; set; }
}