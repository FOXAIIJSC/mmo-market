using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MmoMarket.Application.Auth;
using MmoMarket.Application.Common;

namespace MmoMarket.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AuthService _svc;
    private readonly ICurrentUser _user;
    public AuthController(AuthService svc, ICurrentUser user) { _svc = svc; _user = user; }

    [HttpPost("register")]
    public async Task<AuthResponse> Register([FromBody] RegisterDto dto, CancellationToken ct) => await _svc.RegisterAsync(dto, ct);

    [HttpPost("login")]
    public async Task<AuthResponse> Login([FromBody] LoginDto dto, CancellationToken ct) => await _svc.LoginAsync(dto, ct);

    [HttpGet("me")]
    [Authorize]
    public async Task<UserDto> Me(CancellationToken ct)
    {
        if (_user.UserId is not { } id) throw new AppException("Unauthorized", 401);
        return await _svc.MeAsync(id, ct);
    }

    [HttpPut("profile")]
    [Authorize]
    public async Task<UserDto> UpdateProfile([FromBody] UpdateProfileDto dto, CancellationToken ct)
    {
        if (_user.UserId is not { } id) throw new AppException("Unauthorized", 401);
        return await _svc.UpdateProfileAsync(id, dto, ct);
    }

    [HttpPut("password")]
    [Authorize]
    public async Task ChangePassword([FromBody] ChangePasswordDto dto, CancellationToken ct)
    {
        if (_user.UserId is not { } id) throw new AppException("Unauthorized", 401);
        await _svc.ChangePasswordAsync(id, dto, ct);
    }
}
