using KnowledgeOS.Backend.DTOs.Resources;

namespace KnowledgeOS.Backend.Services.Abstractions;

public interface ICategoryService
{
    Task<List<CategoryDto>> GetAllAsync(string userId);
    Task<CategoryDto> CreateAsync(string userId, CreateCategoryDto dto);
    Task DeleteAsync(Guid id, string userId);
    Task<List<string>> GetUserCategoryNamesAsync(string userId);
    Task<Guid?> GetIdByNameAsync(string userId, string categoryName);
}