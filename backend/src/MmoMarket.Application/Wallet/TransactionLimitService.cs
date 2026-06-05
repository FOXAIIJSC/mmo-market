using Microsoft.EntityFrameworkCore;
using MmoMarket.Application.Common;
using MmoMarket.Application.Config;
using MmoMarket.Application.Sellers;
using MmoMarket.Domain.Entities;
using MmoMarket.Domain.Enums;

namespace MmoMarket.Application.Wallet;

/// <summary>
/// Giới hạn nạp/rút theo ngày theo cấp tài khoản (P1.3, §7.2 tài liệu).
/// Cấp: Chưa KYC → KYC CCCD → Seller Verified (KYC + ≥6 tháng) → Seller VIP.
/// Giá trị 0 hoặc âm = không giới hạn.
/// </summary>
public class TransactionLimitService
{
    private readonly IAppDbContext _db;
    private readonly ConfigService _config;
    private readonly SellerPlanService _plans;
    public TransactionLimitService(IAppDbContext db, ConfigService config, SellerPlanService plans)
    { _db = db; _config = config; _plans = plans; }

    public async Task<(decimal Deposit, decimal Withdraw, string Tier)> GetLimitsAsync(Guid userId, CancellationToken ct)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId, ct)
            ?? throw new AppException("User không tồn tại", 404);
        var seller = await _db.Sellers.FirstOrDefaultAsync(s => s.UserId == userId, ct);
        var kyc = user.KycStatus == KycStatus.Approved;

        if (seller != null)
        {
            var plan = await _plans.ResolvePlanAsync(seller, ct);
            if (plan.Code == "vip")
                return (await D(ConfigKeys.LimitDepositVip, ct), await D(ConfigKeys.LimitWithdrawVip, ct), "vip");
            if (kyc && seller.JoinedAt <= DateTime.UtcNow.AddMonths(-6))
                return (await D(ConfigKeys.LimitDepositSeller, ct), await D(ConfigKeys.LimitWithdrawSeller, ct), "seller");
        }
        if (kyc)
            return (await D(ConfigKeys.LimitDepositKyc, ct), await D(ConfigKeys.LimitWithdrawKyc, ct), "kyc");
        return (await D(ConfigKeys.LimitDepositUnverified, ct), await D(ConfigKeys.LimitWithdrawUnverified, ct), "unverified");
    }

    public async Task EnsureDepositAllowedAsync(Guid userId, decimal amount, CancellationToken ct)
    {
        var (limit, _, _) = await GetLimitsAsync(userId, ct);
        if (limit <= 0) return; // không giới hạn
        var since = DateTime.UtcNow.Date;
        var todayAmounts = await _db.WalletTxns
            .Where(t => t.UserId == userId && t.Type == WalletTxnType.Topup
                && t.Status == WalletTxnStatus.Completed && t.CreatedAt >= since)
            .Select(t => t.Amount)
            .ToListAsync(ct);
        var todaySum = todayAmounts.Sum();
        if (todaySum + amount > limit)
            throw new AppException($"Vượt hạn mức nạp trong ngày ({limit:N0}đ). Hãy hoàn tất KYC để tăng hạn mức.");
    }

    public async Task EnsureWithdrawAllowedAsync(Guid userId, decimal amount, CancellationToken ct)
    {
        var (_, limit, _) = await GetLimitsAsync(userId, ct);
        if (limit <= 0) return;
        var since = DateTime.UtcNow.Date;
        var todayAmounts = await _db.WithdrawRequests
            .Where(w => w.SellerUserId == userId && w.Status != WithdrawStatus.Rejected && w.CreatedAt >= since)
            .Select(w => w.Amount)
            .ToListAsync(ct);
        var todaySum = todayAmounts.Sum();
        if (todaySum + amount > limit)
            throw new AppException($"Vượt hạn mức rút trong ngày ({limit:N0}đ).");
    }

    private async Task<decimal> D(string key, CancellationToken ct) => await _config.GetDecimalAsync(key, 0m, ct);
}
