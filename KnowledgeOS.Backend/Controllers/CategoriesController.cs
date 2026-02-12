using KnowledgeOS.Backend.DTOs.Resources;
using KnowledgeOS.Backend.Services.Abstractions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KnowledgeOS.Backend.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class CategoriesController : ControllerBase
{
    private readonly ICategoryService _categoryService;
    private readonly ICurrentUserService _currentUserService;

    public CategoriesController(ICategoryService categoryService, ICurrentUserService currentUserService)
    {
        _categoryService = categoryService;
        _currentUserService = currentUserService;
    }

    [HttpGet]
    public async Task<ActionResult<List<CategoryDto>>> GetAll()
    {
        var userId = _currentUserService.UserId;
        if (userId == null) return Unauthorized();

        var categories = await _categoryService.GetAllAsync(userId);
        return Ok(categories);
    }

    [HttpPost]
    public async Task<ActionResult<CategoryDto>> Create([FromBody] CreateCategoryDto dto)
    {
        var userId = _currentUserService.UserId;
        if (userId == null) return Unauthorized();

        try
        {
            var created = await _categoryService.CreateAsync(userId, dto);
            return Ok(created);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var userId = _currentUserService.UserId;
        if (userId == null) return Unauthorized();

        await _categoryService.DeleteAsync(id, userId);
        return NoContent();
    }
}