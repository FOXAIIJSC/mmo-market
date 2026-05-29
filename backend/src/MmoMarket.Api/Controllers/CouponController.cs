using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MmoMarket.Application.Common;
using MmoMarket.Application.Coupons;

namespace MmoMarket.Api.Controllers;

[ApiController]
[Route("api/coupons")]
public class CouponController : ControllerBase
{
    private readonly CouponService _svc;
    private readonly ICurrentUser _user;
    public CouponController(CouponService svc, ICurrentUser user) { _svc = svc; _user = user; }

    [HttpGet]
    [Authorize]
    public Task<CouponDto[]> GetAvailable(CancellationToken ct) =>
        _svc.GetAvailableAsync(_user.UserId!.Value, ct);

    [HttpPost("validate")]
    [Authorize]
    public async Task<IActionResult> Validate(
        [FromBody] ValidateCouponRequest req, CancellationToken ct)
    {
        if (_user.UserId is not { } uid) throw new AppException("Unauthorized", 401);
        var result = await _svc.ValidateAsync(uid, req.Code, req.OrderAmount, ct);
        return Ok(result);
    }
}

public record ValidateCouponRequest(string Code, decimal OrderAmount);
