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
    private readonly OrderService  _svc;
    private readonly MoMoService   _momo;
    private readonly ZaloPayService _zalo;
    private readonly VNPayService  _vnpay;
    private readonly VietQrService _vietqr;
    private readonly UsdtService   _usdt;
    private readonly ICurrentUser  _user;

    public OrderController(
        OrderService svc, MoMoService momo, ZaloPayService zalo,
        VNPayService vnpay, VietQrService vietqr, UsdtService usdt, ICurrentUser user)
    { _svc = svc; _momo = momo; _zalo = zalo; _vnpay = vnpay; _vietqr = vietqr; _usdt = usdt; _user = user; }

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
        if (order.Status != "PendingPayment") throw new AppException("Đơn không ở trạng thái chờ thanh toán");
        return await _momo.CreatePaymentAsync(id, order.Total, order.Code);
    }

    [HttpPost("{id:guid}/zalopay-pay")]
    public async Task<ZaloPayResult> ZaloPayPay(Guid id, CancellationToken ct)
    {
        var order = await _svc.GetByIdAsync(Uid, id, ct)
            ?? throw new AppException("Không tìm thấy đơn", 404);
        if (order.Status != "PendingPayment") throw new AppException("Đơn không ở trạng thái chờ thanh toán");
        return await _zalo.CreatePaymentAsync(id, order.Total, order.Code);
    }

    [HttpPost("{id:guid}/vietqr-pay")]
    public async Task<VietQrResult> VietQrPay(Guid id, CancellationToken ct)
    {
        var order = await _svc.GetByIdAsync(Uid, id, ct)
            ?? throw new AppException("Không tìm thấy đơn", 404);
        if (order.Status != "PendingPayment") throw new AppException("Đơn không ở trạng thái chờ thanh toán");
        return _vietqr.GenerateQr(order.Total, order.Code);
    }

    [HttpPost("{id:guid}/vnpay-pay")]
    public async Task<VNPayResult> VNPayPay(Guid id, CancellationToken ct)
    {
        var order = await _svc.GetByIdAsync(Uid, id, ct)
            ?? throw new AppException("Không tìm thấy đơn", 404);
        if (order.Status != "PendingPayment") throw new AppException("Đơn không ở trạng thái chờ thanh toán");
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";
        return _vnpay.CreatePaymentUrl(id, order.Total, order.Code, ip);
    }

    [HttpPost("{id:guid}/usdt-pay")]
    public async Task<UsdtPayResult> UsdtPay(Guid id, CancellationToken ct)
    {
        var order = await _svc.GetByIdAsync(Uid, id, ct)
            ?? throw new AppException("Không tìm thấy đơn", 404);
        if (order.Status != "PendingPayment") throw new AppException("Đơn không ở trạng thái chờ thanh toán");
        return _usdt.GeneratePaymentInfo(id, order.Total, order.Code);
    }

    /// <summary>
    /// Client calls this to trigger a TronGrid scan and auto-confirm if matching USDT tx is found.
    /// Designed for polling from the USDT payment modal (every ~30 s).
    /// </summary>
    [HttpPost("{id:guid}/usdt-check")]
    public async Task<IActionResult> UsdtCheck(Guid id, CancellationToken ct)
    {
        var order = await _svc.GetByIdAsync(Uid, id, ct)
            ?? throw new AppException("Không tìm thấy đơn", 404);
        if (order.PaymentMethod != "Usdt")
            return BadRequest(new { found = false, error = "Not a USDT order" });
        if (order.Status != "PendingPayment")
            return Ok(new { found = false, alreadyPaid = true });

        var found = await _usdt.CheckTransactionAsync(id, order.Total, order.CreatedAt, ct);
        if (found)
            await _svc.ConfirmExternalPaymentAsync(id, ct);

        return Ok(new { found });
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
