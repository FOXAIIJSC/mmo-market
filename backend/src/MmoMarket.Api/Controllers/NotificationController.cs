using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MmoMarket.Application.Common;
using MmoMarket.Application.Notifications;

namespace MmoMarket.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/notifications")]
public class NotificationController : ControllerBase
{
    private readonly NotificationService _svc;
    private readonly ICurrentUser _user;
    public NotificationController(NotificationService svc, ICurrentUser user) { _svc = svc; _user = user; }

    private Guid Uid => _user.UserId ?? throw new AppException("Unauthorized", 401);

    [HttpGet]
    public Task<NotificationDto[]> Get(CancellationToken ct) => _svc.GetAsync(Uid, ct);

    [HttpGet("unread-count")]
    public async Task<IActionResult> UnreadCount(CancellationToken ct) =>
        Ok(new { count = await _svc.UnreadCountAsync(Uid, ct) });

    [HttpPut("{id:guid}/read")]
    public async Task<IActionResult> MarkRead(Guid id, CancellationToken ct)
    {
        await _svc.MarkReadAsync(Uid, id, ct);
        return NoContent();
    }

    [HttpPut("read-all")]
    public async Task<IActionResult> MarkAllRead(CancellationToken ct)
    {
        await _svc.MarkAllReadAsync(Uid, ct);
        return NoContent();
    }
}
