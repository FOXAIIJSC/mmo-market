using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MmoMarket.Application.Common;
using MmoMarket.Application.Wallet;

namespace MmoMarket.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/wallet")]
public class WalletController : ControllerBase
{
    private readonly WalletService _svc;
    private readonly ICurrentUser _user;
    public WalletController(WalletService svc, ICurrentUser user) { _svc = svc; _user = user; }

    private Guid Uid => _user.UserId ?? throw new AppException("Unauthorized", 401);

    [HttpGet]
    public Task<WalletStateDto> Get(CancellationToken ct) => _svc.GetAsync(Uid, ct);

    [HttpPost("topup")]
    public Task<WalletStateDto> Topup([FromBody] TopupDto dto, CancellationToken ct) => _svc.TopupAsync(Uid, dto, ct);
}
