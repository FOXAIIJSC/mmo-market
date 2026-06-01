using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MmoMarket.Application.Orders;
using MmoMarket.Application.Payments;

namespace MmoMarket.Api.Controllers;

[ApiController]
[Route("api/payment")]
public class PaymentController : ControllerBase
{
    private readonly MoMoService _momo;
    private readonly ZaloPayService _zalo;
    private readonly OrderService _order;

    public PaymentController(MoMoService momo, ZaloPayService zalo, OrderService order)
    { _momo = momo; _zalo = zalo; _order = order; }

    /// <summary>
    /// MoMo IPN — server-to-server callback.
    /// NOTE: IpnUrl must be publicly reachable in production (update appsettings.json).
    /// </summary>
    [HttpPost("momo/ipn")]
    [AllowAnonymous]
    public async Task<IActionResult> MoMoIpn([FromBody] MoMoIpnDto dto, CancellationToken ct)
    {
        if (!_momo.VerifyIpnSignature(dto))
            return BadRequest(new { message = "Invalid signature" });

        if (dto.ResultCode == 0 && Guid.TryParse(dto.OrderId, out var orderId))
            await _order.ConfirmExternalPaymentAsync(orderId, ct);

        return Ok(new { message = "OK" });
    }

    /// <summary>
    /// ZaloPay IPN — server-to-server callback (form-urlencoded).
    /// ZaloPay POSTs: data=&lt;json_string&gt;&amp;mac=&lt;hmac&gt;&amp;type=1
    /// NOTE: IpnUrl must be publicly reachable in production (update appsettings.json).
    /// </summary>
    [HttpPost("zalopay/ipn")]
    [AllowAnonymous]
    public async Task<IActionResult> ZaloPayIpn(
        [FromForm] string data, [FromForm] string mac, CancellationToken ct)
    {
        if (!_zalo.VerifyIpnSignature(data, mac))
            return Ok(new { return_code = -1, return_message = "Invalid signature" });

        if (ZaloPayService.ParseStatusFromIpn(data) == 1)
        {
            var orderId = ZaloPayService.ParseOrderIdFromIpn(data);
            if (orderId.HasValue)
                await _order.ConfirmExternalPaymentAsync(orderId.Value, ct);
        }

        // ZaloPay expects: {"return_code":1,"return_message":"Success"}
        return Ok(new { return_code = 1, return_message = "Success" });
    }
}
