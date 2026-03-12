using System.Security.Claims;
using KnowledgeOS.Backend.Constants;
using KnowledgeOS.Backend.Entities.Users;
using Microsoft.AspNetCore.Identity;

namespace KnowledgeOS.Backend.Data;

public static class DbSeeder
{
    public static async Task SeedRolesAsync(IServiceProvider serviceProvider)
    {
        var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();

        if (!await roleManager.RoleExistsAsync("Admin"))
        {
            var adminRole = new IdentityRole("Admin");
            await roleManager.CreateAsync(adminRole);
            await roleManager.AddClaimAsync(adminRole, new Claim("Permission", Permissions.BypassResourceOwnership));
            await roleManager.AddClaimAsync(adminRole, new Claim("Permission", Permissions.BypassUserPrefsOwnership));
            await roleManager.AddClaimAsync(adminRole, new Claim("Permission", Permissions.ResetPasswords));
        }

        if (!await roleManager.RoleExistsAsync("User"))
        {
            await roleManager.CreateAsync(new IdentityRole("User"));
        }
    }

    public static async Task SeedAdminUserAsync(IServiceProvider serviceProvider)
    {
        var userManager = serviceProvider.GetRequiredService<UserManager<IdentityUser>>();

        var adminEmail = "admin@knowledgeos.local";
        var adminUser = await userManager.FindByEmailAsync(adminEmail);
        if (adminUser == null)
        {
            adminUser = new ApplicationUser()
            {
                UserName = adminEmail,
                DisplayName = "Admin",
                Email = adminEmail,
                EmailConfirmed = true
            };

            var result = await userManager.CreateAsync(adminUser, "Admin123!");
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(adminUser, "Admin");
            }
        }
    }
}