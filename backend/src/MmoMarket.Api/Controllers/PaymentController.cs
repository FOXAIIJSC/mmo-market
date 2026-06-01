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
    private readonly OrderService _order;

    public PaymentController(MoMoService momo, OrderService order) { _momo = momo; _order = order; }

    /// <summary>
    /// MoMo IPN (Instant Payment Notification) — server-to-server callback.
    /// MoMo servers POST here when a payment completes or fails.
    /// NOTE: In local dev the IPN URL must be publicly reachable (e.g. via ngrok).
    /// Update MoMo:IpnUrl in appsettings.json with your tunnel URL.
    /// </summary>
    [HttpPost("momo/ipn")]
    [AllowAnonymous]
    public async Task<IActionResult> MoMoIpn([FromBody] MoMoIpnDto dto, CancellationToken ct)
    {
        if (!_momo.VerifyIpnSignature(dto))
            return BadRequest(new { message = "Invalid signature" });

        if (dto.ResultCode == 0 && Guid.TryParse(dto.OrderId, out var orderId))
            await _order.ConfirmExternalPaymentAsync(orderId, ct);

        // MoMo expects HTTP 200 regardless of business outcome
        return Ok(new { message = "OK" });
    }
}
