using KnowledgeOS.Backend.DTOs.Common;
using KnowledgeOS.Backend.DTOs.Resources;
using KnowledgeOS.Backend.Services.Abstractions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KnowledgeOS.Backend.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class VaultController : ControllerBase
{
    private readonly IResourceService _resourceService;
    private readonly ICurrentUserService _currentUserService;

    public VaultController(IResourceService resourceService, ICurrentUserService currentUserService)
    {
        _resourceService = resourceService;
        _currentUserService = currentUserService;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<VaultResourceDto>>> GetVault(
        [FromQuery] PaginationQuery pagination,
        [FromQuery] SearchQuery search,
        [FromQuery] VaultFilter filter)
    {
        var userId = _currentUserService.UserId;
        var result = await _resourceService.GetVaultResourcesAsync(userId!, pagination, search, filter);
        return Ok(result);
    }

    [HttpGet("mix")]
    public async Task<ActionResult<List<VaultResourceDto>>> GetVaultMix()
    {
        var userId = _currentUserService.UserId;
        var mix = await _resourceService.GetVaultMixAsync(userId!);
        return Ok(mix);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<VaultResourceDto>> GetById(Guid id)
    {
        var userId = _currentUserService.UserId;
        var resource = await _resourceService.GetVaultResourceByIdAsync(id, userId!);
        if (resource == null) return NotFound();
        return Ok(resource);
    }

    [HttpPatch("{id}/category")]
    public async Task<IActionResult> UpdateCategory(Guid id, [FromBody] UpdateResourceCategoryDto dto)
    {
        var userId = _currentUserService.UserId;
        try
        {
            await _resourceService.AssignCategoryAsync(id, userId!, dto.CategoryId);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }
}