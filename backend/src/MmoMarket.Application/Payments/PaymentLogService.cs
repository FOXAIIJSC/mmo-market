using Microsoft.EntityFrameworkCore;
using MmoMarket.Application.Common;
using MmoMarket.Domain.Entities;
using MmoMarket.Domain.Enums;

namespace MmoMarket.Application.Payments;

/// <summary>
/// Ghi nhận mọi callback/IPN từ cổng thanh toán vào PaymentTransaction để đối soát
/// và chống ghi nhận trùng (idempotency theo Provider + ProviderTxnId).
/// </summary>
public class PaymentLogService
{
    private readonly IAppDbContext _db;
    public PaymentLogService(IAppDbContext db) => _db = db;

    /// <summary>Trả về false nếu giao dịch đã được ghi nhận trước đó (trùng).</summary>
    public async Task<bool> RecordAsync(string provider, string providerTxnId, PaymentMethod method,
        decimal amount, Guid? orderId, string status, string? rawPayload, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(providerTxnId))
            providerTxnId = Guid.NewGuid().ToString("N");

        var exists = await _db.PaymentTransactions
            .AnyAsync(t => t.Provider == provider && t.ProviderTxnId == providerTxnId, ct);
        if (exists) return false;

        _db.PaymentTransactions.Add(new PaymentTransaction
        {
            OrderId = orderId,
            Method = method,
            Provider = provider,
            ProviderTxnId = providerTxnId,
            Amount = amount,
            Status = status,
            RawPayload = rawPayload,
        });
        await _db.SaveChangesAsync(ct);
        return true;
    }
}
