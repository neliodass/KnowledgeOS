using Hangfire;
using KnowledgeOS.Backend.Data;
using KnowledgeOS.Backend.DTOs.Common;
using KnowledgeOS.Backend.DTOs.Resources;
using KnowledgeOS.Backend.Entities.Resources;
using KnowledgeOS.Backend.Entities.Resources.ConcreteResources;
using KnowledgeOS.Backend.Services.Abstractions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KnowledgeOS.Backend.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class ResourcesController : ControllerBase
{
    private readonly IResourceService _resourceService;
    private readonly ICurrentUserService _currentUserService;

    public ResourcesController(IResourceService resourceService, ICurrentUserService currentUserService)
    {
        _resourceService = resourceService;
        _currentUserService = currentUserService;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateResourceDto dto)
    {
        var userId = _currentUserService.UserId;
        var id = await _resourceService.CreateResourceAsync(dto, userId!);

        return Ok(new { id });
    }

    [HttpGet("inbox")]
    public async Task<ActionResult<PagedResult<InboxResourceDto>>> GetInbox(
        [FromQuery] PaginationQuery pagination, [FromQuery] SearchQuery search)
    {
        var userId = _currentUserService.UserId;
        if (userId == null) return Unauthorized();
        var result = await _resourceService.GetInboxResourcesAsync(userId, pagination, search);
        return Ok(result);
    }

    [HttpGet("vault")]
    public async Task<ActionResult<PagedResult<VaultResourceDto>>> GetVault(
        [FromQuery] PaginationQuery pagination,
        [FromQuery] SearchQuery search,
        [FromQuery] VaultFilter filter)
    {
        var userId = _currentUserService.UserId;
        if (userId == null) return Unauthorized();
        var result = await _resourceService.GetVaultResourcesAsync(userId, pagination, search, filter);
        return Ok(result);
    }

    [HttpGet("mix")]
    public async Task<ActionResult<List<InboxResourceDto>>> GetSmartMix()
    {
        var userId = _currentUserService.UserId;
        if (userId == null) return Unauthorized();

        var mix = await _resourceService.GetSmartMixAsync(userId);
        return Ok(mix);
    }

    [HttpGet("vault/mix")]
    public async Task<ActionResult<List<VaultResourceDto>>> GetVaultMix()
    {
        var userId = _currentUserService.UserId;
        var mix = await _resourceService.GetVaultMixAsync(userId);
        return Ok(mix);
    }

    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateResourceStatusDto dto)
    {
        var userId = _currentUserService.UserId;
        if (userId == null) return Unauthorized();

        try
        {
            await _resourceService.UpdateResourceStatusAsync(id, userId, dto.Status);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpGet("inbox/{id}")]
    public async Task<ActionResult<InboxResourceDto>> GetInboxSingle(Guid id)
    {
        var userId = _currentUserService.UserId;
        if (userId == null) return Unauthorized();

        var resource = await _resourceService.GetInboxResourceByIdAsync(id, userId);

        if (resource == null) return NotFound();

        return Ok(resource);
    }

    [HttpGet("vault/{id}")]
    public async Task<ActionResult<VaultResourceDto>> GetVaultSingle(Guid id)
    {
        var userId = _currentUserService.UserId;
        if (userId == null) return Unauthorized();

        var resource = await _resourceService.GetVaultResourceByIdAsync(id, userId);

        if (resource == null) return NotFound();

        return Ok(resource);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var userId = _currentUserService.UserId;
        if (userId == null) return Unauthorized();

        await _resourceService.DeleteResourceAsync(id, userId);

        return NoContent();
    }

    [HttpPost("{id}/retry")]
    public async Task<IActionResult> Retry(Guid id)
    {
        var userId = _currentUserService.UserId;
        if (userId == null) return Unauthorized();

        try
        {
            await _resourceService.RetryProcessingAsync(id, userId);
            return Accepted();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpPatch("{id}/category")]
    public async Task<IActionResult> UpdateCategory(Guid id, [FromBody] UpdateResourceCategoryDto dto)
    {
        var userId = _currentUserService.UserId;
        if (userId == null) return Unauthorized();

        try
        {
            await _resourceService.AssignCategoryAsync(id, userId, dto.CategoryId);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }
}