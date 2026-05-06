using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MmoMarket.Application.Cart;
using MmoMarket.Application.Common;

namespace MmoMarket.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/cart")]
public class CartController : ControllerBase
{
    private readonly CartService _svc;
    private readonly ICurrentUser _user;
    public CartController(CartService svc, ICurrentUser user) { _svc = svc; _user = user; }

    private Guid Uid => _user.UserId ?? throw new AppException("Unauthorized", 401);

    [HttpGet]
    public Task<CartDto> Get(CancellationToken ct) => _svc.GetAsync(Uid, ct);

    [HttpPost]
    public Task<CartDto> Add([FromBody] AddCartDto dto, CancellationToken ct) => _svc.AddAsync(Uid, dto, ct);

    [HttpPut("{id:guid}")]
    public Task<CartDto> Update(Guid id, [FromBody] UpdateCartDto dto, CancellationToken ct) => _svc.UpdateAsync(Uid, id, dto, ct);

    [HttpDelete("{id:guid}")]
    public Task<CartDto> Remove(Guid id, CancellationToken ct) => _svc.RemoveAsync(Uid, id, ct);
}
