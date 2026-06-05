using MmoMarket.Domain.Common;
using MmoMarket.Domain.Enums;

namespace MmoMarket.Domain.Entities;

/// <summary>
/// Lưu mọi callback/IPN từ cổng thanh toán để đối soát & chống ghi nhận trùng (double-credit).
/// Idempotency theo (Provider, ProviderTxnId).
/// </summary>
public class PaymentTransaction : Entity
{
    public Guid? OrderId { get; set; }
    public PaymentMethod Method { get; set; }
    public string Provider { get; set; } = "";       // momo | zalopay | vnpay | sepay | usdt
    public string ProviderTxnId { get; set; } = "";   // mã giao dịch từ cổng (khóa idempotency)
    public decimal Amount { get; set; }
    public string Status { get; set; } = "";          // success | failed | pending
    public string? RawPayload { get; set; }           // payload gốc (JSON/query) để đối soát
}
