using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MmoMarket.Application.Common;
using MmoMarket.Application.Wishlist;

namespace MmoMarket.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/wishlist")]
public class WishlistController : ControllerBase
{
    private readonly WishlistService _svc;
    private readonly ICurrentUser _user;
    public WishlistController(WishlistService svc, ICurrentUser user) { _svc = svc; _user = user; }

    private Guid Uid => _user.UserId ?? throw new AppException("Unauthorized", 401);

    [HttpGet]
    public Task<WishlistProductDto[]> Get(CancellationToken ct) => _svc.GetAsync(Uid, ct);

    [HttpGet("ids")]
    public Task<string[]> GetIds(CancellationToken ct) => _svc.GetIdsAsync(Uid, ct);

    [HttpPost("{productId:guid}")]
    public async Task<IActionResult> Toggle(Guid productId, CancellationToken ct)
    {
        var added = await _svc.ToggleAsync(Uid, productId, ct);
        return Ok(new { added });
    }
}
