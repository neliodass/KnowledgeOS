using KnowledgeOS.Backend.Constants;
using KnowledgeOS.Backend.Entities.Abstractions;
using KnowledgeOS.Backend.Services.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace KnowledgeOS.Backend.Extensions;

public static class ModelBuilderOwnershipExtensions
{
    public static void ApplyResourceOwnershipFilter<TEntity>(
        this ModelBuilder modelBuilder,
        ICurrentUserService currentUserService)
        where TEntity : class, IUserOwnedResource
    {
        modelBuilder.Entity<TEntity>()
            .HasQueryFilter(e => currentUserService.HasPermission(Permissions.BypassResourceOwnership) ||
            e.UserId == currentUserService.UserId);
    }
}