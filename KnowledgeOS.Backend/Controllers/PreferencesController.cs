using KnowledgeOS.Backend.DTOs.Users;
using KnowledgeOS.Backend.Services.Abstractions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KnowledgeOS.Backend.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class PreferencesController : ControllerBase
{
    private readonly IUserPreferencesService _preferencesService;
    private readonly IProfileRefineService _profileRefineService;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<PreferencesController> _logger;

    public PreferencesController(
        IUserPreferencesService preferencesService,
        IProfileRefineService profileRefineService,
        ICurrentUserService currentUserService,
        ILogger<PreferencesController> logger)
    {
        _preferencesService = preferencesService;
        _profileRefineService = profileRefineService;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var userId = _currentUserService.UserId;
        if (userId == null) return Unauthorized();

        var prefs = await _preferencesService.GetPreferencesAsync(userId);
        return Ok(prefs);
    }

    [HttpPut]
    public async Task<IActionResult> Update([FromBody] UserPreferenceDto dto)
    {
        var userId = _currentUserService.UserId;
        if (userId == null) return Unauthorized();

        await _preferencesService.UpdatePreferencesAsync(userId, dto);
        return Ok(new { message = "Preferences updated successfully" });
    }

    [HttpPost("refine")]
    public async Task<ActionResult<ProfileRefineResponseDto>> Refine([FromBody] ProfileRefineRequestDto request,
        CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (userId == null) return Unauthorized();

        try
        {
            var result = await _profileRefineService.RefineAsync(
                userId, request.Message, request.ResourceId, cancellationToken);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Profile refine failed for user {UserId}", userId);
            return StatusCode(502, new { message = "AI profile refine failed. Try again or edit fields manually." });
        }
    }
}