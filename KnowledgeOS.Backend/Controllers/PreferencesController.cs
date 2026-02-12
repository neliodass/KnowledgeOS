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
    private readonly ICurrentUserService _currentUserService;

    public PreferencesController(
        IUserPreferencesService preferencesService,
        ICurrentUserService currentUserService)
    {
        _preferencesService = preferencesService;
        _currentUserService = currentUserService;
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
}