using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using KnowledgeOS.Backend.DTOs.Auth;
using KnowledgeOS.Backend.Entities.Users;
using KnowledgeOS.Backend.Services.Abstractions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;


namespace KnowledgeOS.Backend.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly IIdentityService _identityService;

    public AuthController(IIdentityService identityService)
    {
        _identityService = identityService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        var result = await _identityService.RegisterAsync(dto);

        if (!result.Succeeded) return BadRequest(result.Errors);

        return Ok(new { message = "User registered successfully" });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var token = await _identityService.LoginAsync(dto);

        if (token == null) return Unauthorized("Invalid credentials");

        return Ok(new { token });
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> GetDisplayName()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        var displayName = await _identityService.GetDisplayNameAsync(userId);
        if (displayName == null) return NotFound();

        return Ok(new { displayName });
    }

    [Authorize]
    [HttpPut("me/password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        var result = await _identityService.ChangePasswordAsync(userId, dto);

        if (!result.Succeeded) return BadRequest(result.Errors);

        return NoContent();
    }

    [Authorize]
    [HttpPut("me/display-name")]
    public async Task<IActionResult> ChangeDisplayName([FromBody] ChangeDisplayNameDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        var result = await _identityService.ChangeDisplayNameAsync(userId, dto);

        if (!result.Succeeded) return BadRequest(result.Errors);

        return NoContent();
    }
}