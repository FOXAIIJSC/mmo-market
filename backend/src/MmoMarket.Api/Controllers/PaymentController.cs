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
    private readonly VNPayService _vnpay;
    private readonly VietQrService _vietqr;
    private readonly OrderService _order;

    public PaymentController(MoMoService momo, ZaloPayService zalo, VNPayService vnpay, VietQrService vietqr, OrderService order)
    { _momo = momo; _zalo = zalo; _vnpay = vnpay; _vietqr = vietqr; _order = order; }

    /// <summary>
    /// MoMo IPN — server-to-server callback (JSON body).
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
    /// ZaloPay IPN — server-to-server callback (form-urlencoded: data=&amp;mac=&amp;type=1).
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

        return Ok(new { return_code = 1, return_message = "Success" });
    }

    /// <summary>
    /// VNPay IPN — server-to-server callback (GET query string).
    /// </summary>
    [HttpGet("vnpay/ipn")]
    [AllowAnonymous]
    public async Task<IActionResult> VNPayIpn(CancellationToken ct)
    {
        var queryParams = Request.Query.ToDictionary(kv => kv.Key, kv => kv.Value.ToString());

        if (!_vnpay.VerifyIpnSignature(queryParams))
            return Ok(new { RspCode = "97", Message = "Invalid Checksum" });

        var responseCode = queryParams.GetValueOrDefault("vnp_ResponseCode", "");
        var txnStatus    = queryParams.GetValueOrDefault("vnp_TransactionStatus", "");

        if (responseCode == "00" && txnStatus == "00")
        {
            var orderId = VNPayService.ParseOrderIdFromIpn(queryParams);
            if (orderId.HasValue)
            {
                var confirmed = await _order.ConfirmExternalPaymentAsync(orderId.Value, ct);
                if (!confirmed)
                    return Ok(new { RspCode = "02", Message = "Order already confirmed" });
            }
            else
            {
                return Ok(new { RspCode = "01", Message = "Order Not Found" });
            }
        }

        return Ok(new { RspCode = "00", Message = "Confirm Success" });
    }

    /// <summary>
    /// SePay webhook — bank transfer confirmation (VietQR).
    /// SePay POSTs JSON; header: Authorization: Apikey {key}
    /// NOTE: Webhook URL must be publicly reachable (update appsettings.json / ngrok).
    /// </summary>
    [HttpPost("sepay/webhook")]
    [AllowAnonymous]
    public async Task<IActionResult> SePayWebhook([FromBody] SePayWebhookDto dto, CancellationToken ct)
    {
        var auth = Request.Headers.Authorization.FirstOrDefault();
        if (!_vietqr.VerifySePayWebhook(auth))
            return Unauthorized(new { success = false, message = "Invalid API key" });

        // Only process incoming transfers (transferType == "in")
        if (!string.Equals(dto.TransferType, "in", StringComparison.OrdinalIgnoreCase))
            return Ok(new { success = true });

        await _order.ConfirmExternalPaymentByTransferNoteAsync(dto.Content ?? "", ct);

        return Ok(new { success = true });
    }
}
