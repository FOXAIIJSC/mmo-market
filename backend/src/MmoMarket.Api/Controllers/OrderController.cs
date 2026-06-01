using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MmoMarket.Application.Common;
using MmoMarket.Application.Orders;
using MmoMarket.Application.Payments;

namespace MmoMarket.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/orders")]
public class OrderController : ControllerBase
{
    private readonly OrderService _svc;
    private readonly MoMoService _momo;
    private readonly ICurrentUser _user;
    public OrderController(OrderService svc, MoMoService momo, ICurrentUser user)
    { _svc = svc; _momo = momo; _user = user; }

    private Guid Uid => _user.UserId ?? throw new AppException("Unauthorized", 401);

    [HttpPost("checkout")]
    public Task<OrderDto> Checkout([FromBody] CheckoutDto dto, CancellationToken ct) => _svc.CheckoutAsync(Uid, dto, ct);

    [HttpPost("{id:guid}/pay")]
    public Task<OrderDto> Pay(Guid id, CancellationToken ct) => _svc.SimulatePayAsync(Uid, id, ct);

    [HttpPost("{id:guid}/momo-pay")]
    public async Task<MoMoPayResult> MomoPay(Guid id, CancellationToken ct)
    {
        var order = await _svc.GetByIdAsync(Uid, id, ct)
            ?? throw new AppException("Không tìm thấy đơn", 404);
        if (order.Status != "PendingPayment")
            throw new AppException("Đơn không ở trạng thái chờ thanh toán");
        return await _momo.CreatePaymentAsync(id, order.Total, order.Code);
    }

    [HttpPost("{id:guid}/confirm")]
    public Task<OrderDto> Confirm(Guid id, CancellationToken ct) => _svc.ConfirmReceivedAsync(Uid, id, ct);

    [HttpGet]
    public Task<OrderDto[]> List([FromQuery] string? status, CancellationToken ct) => _svc.GetMyOrdersAsync(Uid, status, ct);

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id, CancellationToken ct)
    {
        var order = await _svc.GetByIdAsync(Uid, id, ct);
        return order == null ? NotFound() : Ok(order);
    }
}
