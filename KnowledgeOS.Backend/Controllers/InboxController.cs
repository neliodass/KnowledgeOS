using KnowledgeOS.Backend.DTOs.Common;
using KnowledgeOS.Backend.DTOs.Resources;
using KnowledgeOS.Backend.Services.Abstractions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KnowledgeOS.Backend.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class InboxController : ControllerBase
{
    private readonly IResourceService _resourceService;
    private readonly ICurrentUserService _currentUserService;

    public InboxController(IResourceService resourceService, ICurrentUserService currentUserService)
    {
        _resourceService = resourceService;
        _currentUserService = currentUserService;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<InboxResourceDto>>> GetInbox(
        [FromQuery] PaginationQuery pagination, [FromQuery] SearchQuery search)
    {
        var userId = _currentUserService.UserId;
        var result = await _resourceService.GetInboxResourcesAsync(userId!, pagination, search);
        return Ok(result);
    }

    [HttpGet("mix")]
    public async Task<ActionResult<List<InboxResourceDto>>> GetSmartMix()
    {
        var userId = _currentUserService.UserId;
        var mix = await _resourceService.GetSmartMixAsync(userId!);
        return Ok(mix);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<InboxResourceDto>> GetById(Guid id)
    {
        var userId = _currentUserService.UserId;
        var resource = await _resourceService.GetInboxResourceByIdAsync(id, userId!);
        if (resource == null) return NotFound();
        return Ok(resource);
    }
}