using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MmoMarket.Application.Common;
using MmoMarket.Application.Disputes;

namespace MmoMarket.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/disputes")]
public class DisputeController : ControllerBase
{
    private readonly DisputeService _svc;
    private readonly ICurrentUser _user;
    public DisputeController(DisputeService svc, ICurrentUser user) { _svc = svc; _user = user; }

    private Guid Uid => _user.UserId ?? throw new AppException("Unauthorized", 401);
    private bool IsAdmin => _user.Role == "Admin" || _user.Role == "SuperAdmin";

    [HttpPost]
    public Task<DisputeDetailDto> Open([FromBody] DisputeOpenDto dto, CancellationToken ct) => _svc.OpenAsync(Uid, dto, ct);

    [HttpGet("mine")]
    public Task<DisputeListItemDto[]> Mine(CancellationToken ct) => _svc.ListMineAsync(Uid, ct);

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id, CancellationToken ct)
    {
        var d = await _svc.GetDetailAsync(id, Uid, IsAdmin, ct);
        return d == null ? NotFound() : Ok(d);
    }

    [HttpPost("{id:guid}/messages")]
    public Task<DisputeMessageDto> AddMessage(Guid id, [FromBody] DisputeMessageCreateDto dto, CancellationToken ct) => _svc.AddMessageAsync(Uid, id, dto, IsAdmin, ct);
}
