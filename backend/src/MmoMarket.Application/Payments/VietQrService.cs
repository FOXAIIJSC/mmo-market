using Microsoft.Extensions.Configuration;

namespace MmoMarket.Application.Payments;

public record VietQrResult(
    string QrImageUrl,
    string BankId,
    string AccountNo,
    string AccountName,
    string TransferNote);

public record SePayWebhookDto(
    int Id,
    string? Gateway,
    string? TransactionDate,
    string? AccountNumber,
    string? SubAccount,
    string? Code,
    string? Content,
    string? TransferType,
    decimal TransferAmount,
    decimal? Accumulated,
    string? ReferenceCode);

public class VietQrService
{
    private readonly string _bankId;
    private readonly string _accountNo;
    private readonly string _accountName;
    private readonly string _template;
    private readonly string _sePayApiKey;

    public VietQrService(IConfiguration config)
    {
        var s = config.GetSection("VietQR");
        _bankId      = s["BankId"]      ?? "TPB";
        _accountNo   = s["AccountNo"]   ?? "";
        _accountName = s["AccountName"] ?? "";
        _template    = s["Template"]    ?? "compact2";
        _sePayApiKey = s["SePayApiKey"] ?? "";
    }

    // Build a VietQR.io image URL with pre-filled amount + transfer note.
    // No external HTTP call — the URL is rendered by <img> on the client.
    public VietQrResult GenerateQr(decimal amount, string orderCode)
    {
        var amountLong  = (long)Math.Round(amount);
        var transferNote = orderCode; // customer MUST include exactly this in the bank transfer description

        var qrImageUrl =
            $"https://img.vietqr.io/image/{_bankId}-{_accountNo}-{_template}.jpg" +
            $"?amount={amountLong}" +
            $"&addInfo={Uri.EscapeDataString(transferNote)}" +
            $"&accountName={Uri.EscapeDataString(_accountName)}";

        return new VietQrResult(qrImageUrl, _bankId, _accountNo, _accountName, transferNote);
    }

    // Verify SePay webhook request.
    // SePay sends: Authorization: Apikey {configured-key}
    // If no key is configured, skip verification (dev/test mode).
    public bool VerifySePayWebhook(string? authorizationHeader)
    {
        if (string.IsNullOrEmpty(_sePayApiKey)) return true;
        return string.Equals(authorizationHeader, $"Apikey {_sePayApiKey}",
            StringComparison.OrdinalIgnoreCase);
    }
}
