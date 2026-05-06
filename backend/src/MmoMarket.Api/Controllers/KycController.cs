using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MmoMarket.Application.Common;
using MmoMarket.Application.Sellers;

namespace MmoMarket.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/kyc")]
public class KycController : ControllerBase
{
    private readonly KycService _svc;
    private readonly ICurrentUser _user;
    public KycController(KycService svc, ICurrentUser user) { _svc = svc; _user = user; }

    private Guid Uid => _user.UserId ?? throw new AppException("Unauthorized", 401);

    [HttpPost]
    public Task<KycDto> Submit([FromBody] KycSubmitDto dto, CancellationToken ct) => _svc.SubmitAsync(Uid, dto, ct);

    [HttpGet("me")]
    public async Task<IActionResult> Me(CancellationToken ct)
    {
        var k = await _svc.GetMineAsync(Uid, ct);
        return k == null ? NotFound() : Ok(k);
    }

    [HttpGet("pending")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public Task<KycDto[]> Pending(CancellationToken ct) => _svc.ListPendingAsync(ct);

    [HttpPost("{id:guid}/approve")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public Task<KycDto> Approve(Guid id, CancellationToken ct) => _svc.ApproveAsync(id, ct);

    [HttpPost("{id:guid}/reject")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public Task<KycDto> Reject(Guid id, [FromBody] RejectDto body, CancellationToken ct) => _svc.RejectAsync(id, body.Reason, ct);
}

public record RejectDto(string Reason);
