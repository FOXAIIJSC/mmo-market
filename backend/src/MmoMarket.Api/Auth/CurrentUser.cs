using System.Security.Claims;
using MmoMarket.Application.Common;

namespace MmoMarket.Api.Auth;

public class CurrentUser : ICurrentUser
{
    public CurrentUser(IHttpContextAccessor accessor)
    {
        var u = accessor.HttpContext?.User;
        if (u?.Identity?.IsAuthenticated == true)
        {
            IsAuthenticated = true;
            var sub = u.FindFirstValue(ClaimTypes.NameIdentifier);
            if (Guid.TryParse(sub, out var id)) UserId = id;
            Username = u.FindFirstValue(ClaimTypes.Name);
            Role = u.FindFirstValue(ClaimTypes.Role);
        }
    }

    public Guid? UserId { get; }
    public string? Username { get; }
    public string? Role { get; }
    public bool IsAuthenticated { get; }
}
