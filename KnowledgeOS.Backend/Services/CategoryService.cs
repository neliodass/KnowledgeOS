using KnowledgeOS.Backend.Data;
using KnowledgeOS.Backend.DTOs.Resources;
using KnowledgeOS.Backend.Entities.Tagging;
using KnowledgeOS.Backend.Services.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace KnowledgeOS.Backend.Services;

public class CategoryService : ICategoryService
{
    private readonly AppDbContext _context;

    public CategoryService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<CategoryDto>> GetAllAsync(string userId)
    {
        return await _context.Categories
            .Where(c => c.UserId == userId)
            .Select(c => new CategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                ResourceCount = c.Resources.Count
            })
            .OrderBy(c => c.Name)
            .ToListAsync();
    }

    public async Task<CategoryDto> CreateAsync(string userId, CreateCategoryDto dto)
    {
        var exists = await _context.Categories
            .AnyAsync(c => c.UserId == userId && c.Name == dto.Name);

        if (exists) throw new InvalidOperationException("Category with this name already exists.");

        var category = new Category
        {
            UserId = userId,
            Name = dto.Name
        };

        _context.Categories.Add(category);
        await _context.SaveChangesAsync();

        return new CategoryDto
        {
            Id = category.Id,
            Name = category.Name,
            ResourceCount = 0
        };
    }

    public async Task DeleteAsync(Guid id, string userId)
    {
        var category = await _context.Categories
            .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

        if (category == null) return;
        _context.Categories.Remove(category);
        await _context.SaveChangesAsync();
    }

    public async Task<List<string>> GetUserCategoryNamesAsync(string userId)
    {
        return await _context.Categories
            .IgnoreQueryFilters()
            .Where(c => c.UserId == userId)
            .Select(c => c.Name)
            .ToListAsync();
    }

    public async Task<Guid?> GetIdByNameAsync(string userId, string categoryName)
    {
        var category = await _context.Categories
            .IgnoreQueryFilters()
            .Where(c => c.UserId == userId && c.Name.ToLower() == categoryName.ToLower())
            .Select(c => c.Id)
            .FirstOrDefaultAsync();

        return category == Guid.Empty ? null : category;
    }
}