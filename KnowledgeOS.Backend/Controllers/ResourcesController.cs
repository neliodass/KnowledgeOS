using KnowledgeOS.Backend.DTOs.Resources;
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

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var userId = _currentUserService.UserId;
        await _resourceService.DeleteResourceAsync(id, userId!);
        return NoContent();
    }

    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateResourceStatusDto dto)
    {
        var userId = _currentUserService.UserId;
        try
        {
            await _resourceService.UpdateResourceStatusAsync(id, userId!, dto.Status);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpPost("{id}/retry")]
    public async Task<IActionResult> Retry(Guid id)
    {
        var userId = _currentUserService.UserId;
        try
        {
            await _resourceService.RetryProcessingAsync(id, userId!);
            return Accepted();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }
}