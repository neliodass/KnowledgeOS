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
        var id = await _resourceService.CreateResourceAsync(dto.Url, userId!);

        return Ok(new { id });
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<ResourceDto>>> GetAll(
        [FromQuery] PaginationQuery pagination,
        [FromQuery] ResourceStatus? status)
    {
        var userId = _currentUserService.UserId;
        if (userId == null) return Unauthorized();

        var resources = await _resourceService.GetUserResourcesAsync(userId, pagination, status);
        return Ok(resources);
    }

    [HttpGet("mix")]
    public async Task<ActionResult<List<ResourceDto>>> GetSmartMix()
    {
        var userId = _currentUserService.UserId;
        if (userId == null) return Unauthorized();

        var mix = await _resourceService.GetSmartMixAsync(userId);
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
}