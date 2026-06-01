using System.Text.Json;
using Microsoft.Extensions.Configuration;

namespace MmoMarket.Application.Payments;

public record UsdtPayResult(
    string Address,
    decimal UsdtAmount,
    string QrImageUrl,
    decimal ExchangeRate);

public class UsdtService
{
    private static readonly HttpClient _http = new() { Timeout = TimeSpan.FromSeconds(15) };

    // USDT TRC20 contract on TRON mainnet (6 decimals)
    private const string UsdtContract    = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";
    private const int    UsdtDecimals    = 6;

    private readonly string  _address;
    private readonly decimal _exchangeRate;   // VND per 1 USDT
    private readonly string  _tronApiKey;     // TronGrid Pro API key (optional)
    private readonly string  _tronApiBase;

    public UsdtService(IConfiguration config)
    {
        var s = config.GetSection("Usdt");
        _address      = s["Address"] ?? "";
        _exchangeRate = decimal.TryParse(s["ExchangeRateVnd"], out var r) ? r : 25_000m;
        _tronApiKey   = s["TronGridApiKey"] ?? "";
        // Allow testnet override; default = mainnet
        _tronApiBase  = (s["UseTestnet"]?.ToLower() == "true")
            ? "https://nile.trongrid.io"
            : "https://api.trongrid.io";
    }

    // Returns payment info: address, exact USDT amount, QR of the address.
    // No external HTTP call — pure calculation.
    public UsdtPayResult GeneratePaymentInfo(Guid orderId, decimal vndAmount, string orderCode)
    {
        var usdtAmount = CalculateUsdtAmount(orderId, vndAmount);
        // QR encodes just the TRON address — any TRC20 wallet can scan it
        var qrUrl = $"https://api.qrserver.com/v1/create-qr-code/?data={Uri.EscapeDataString(_address)}&size=200x200&margin=8";
        return new UsdtPayResult(_address, usdtAmount, qrUrl, _exchangeRate);
    }

    // Poll TronGrid for an incoming USDT transfer matching the expected amount.
    public async Task<bool> CheckTransactionAsync(Guid orderId, decimal vndAmount, DateTime orderCreatedAt, CancellationToken ct)
    {
        if (string.IsNullOrEmpty(_address)) return false;

        var expectedUsdt  = CalculateUsdtAmount(orderId, vndAmount);
        var expectedValue = (long)Math.Round(expectedUsdt * (decimal)Math.Pow(10, UsdtDecimals));

        // Search only transactions after order creation (with a 5-min buffer for clock drift)
        var minTs = new DateTimeOffset(orderCreatedAt.AddMinutes(-5), TimeSpan.Zero).ToUnixTimeMilliseconds();

        var url = $"{_tronApiBase}/v1/accounts/{_address}/transactions/trc20" +
                  $"?contract_address={UsdtContract}&only_to=true&limit=50&min_timestamp={minTs}&order_by=block_timestamp,desc";

        var request = new HttpRequestMessage(HttpMethod.Get, url);
        if (!string.IsNullOrEmpty(_tronApiKey))
            request.Headers.Add("TRON-PRO-API-KEY", _tronApiKey);

        try
        {
            var response = await _http.SendAsync(request, ct);
            if (!response.IsSuccessStatusCode) return false;

            var json = await response.Content.ReadAsStringAsync(ct);
            using var doc = JsonDocument.Parse(json);

            if (!doc.RootElement.TryGetProperty("data", out var data)) return false;

            foreach (var tx in data.EnumerateArray())
            {
                // Verify recipient is our address
                if (!tx.TryGetProperty("to", out var toEl)) continue;
                if (!string.Equals(toEl.GetString(), _address, StringComparison.OrdinalIgnoreCase)) continue;

                // Verify raw token amount
                if (!tx.TryGetProperty("value", out var valEl)) continue;
                if (!long.TryParse(valEl.GetString(), out var txValue)) continue;
                if (txValue != expectedValue) continue;

                return true; // Matching transaction found
            }
        }
        catch { /* TronGrid unreachable — return false, client can retry */ }

        return false;
    }

    // Deterministic unique USDT amount per order.
    // Adds a small suffix (0.00–0.98 USDT) derived from orderId bytes to avoid same-amount collisions.
    // NOTE: _exchangeRate must stay constant while orders are pending (don't change config mid-flight).
    public decimal CalculateUsdtAmount(Guid orderId, decimal vndAmount)
    {
        var baseUsdt = Math.Max(0.01m, Math.Round(vndAmount / _exchangeRate, 2));
        var bytes    = orderId.ToByteArray();
        var suffix   = bytes.Aggregate(0, (acc, b) => acc + b) % 99; // 0-98
        return baseUsdt + suffix * 0.01m;
    }
}
