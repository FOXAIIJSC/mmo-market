using Microsoft.EntityFrameworkCore;
using MmoMarket.Application.Common;
using MmoMarket.Application.Config;
using MmoMarket.Domain.Entities;

namespace MmoMarket.Application.Sellers;

/// <summary>
/// Trust Score (điểm uy tín seller 0–100, P2.1, §8). Cộng/trừ điểm theo sự kiện;
/// các hàm sự kiện chỉ STAGE thay đổi (caller gọi SaveChanges trong cùng transaction).
/// Award30dCleanBonusAsync tự lưu (gọi bởi background worker).
/// </summary>
public class TrustScoreService
{
    private readonly IAppDbContext _db;
    private readonly ConfigService _config;
    public TrustScoreService(IAppDbContext db, ConfigService config) { _db = db; _config = config; }

    public async Task AdjustAsync(Guid sellerId, int delta, string reason, bool isViolation, CancellationToken ct)
    {
        if (delta == 0) return;
        var seller = await _db.Sellers.FirstOrDefaultAsync(s => s.Id == sellerId, ct);
        if (seller == null) return;
        var before = seller.TrustScore;
        seller.TrustScore = Math.Clamp(seller.TrustScore + delta, 0, 100);
        if (isViolation) seller.LastViolationAt = DateTime.UtcNow;
        _db.AuditLogs.Add(new AuditLog
        {
            ActorUserId = null,
            ActorRole = "System",
            Action = "trust_adjust",
            EntityType = "Seller",
            EntityId = seller.Id.ToString(),
            Amount = delta,
            Detail = $"Trust {before}→{seller.TrustScore} ({reason})",
        });
    }

    public async Task OnOrderCompletedSellersAsync(IEnumerable<Guid> sellerIds, CancellationToken ct)
    {
        var d = await _config.GetIntAsync(ConfigKeys.TrustCompleteNoReview, 1, ct);
        foreach (var sid in sellerIds.Distinct())
            await AdjustAsync(sid, d, "hoàn thành đơn", false, ct);
    }

    public async Task OnReviewAsync(Guid sellerId, int rating, CancellationToken ct)
    {
        if (rating >= 5)
        {
            var five = await _config.GetIntAsync(ConfigKeys.TrustComplete5Star, 2, ct);
            var nore = await _config.GetIntAsync(ConfigKeys.TrustCompleteNoReview, 1, ct);
            await AdjustAsync(sellerId, five - nore, "đánh giá 5★", false, ct); // cộng thêm để đạt mức 5★
        }
        else if (rating <= 2)
        {
            await AdjustAsync(sellerId, await _config.GetIntAsync(ConfigKeys.TrustReviewLow, -3, ct), "đánh giá 1–2★", false, ct);
        }
    }

    public async Task OnDisputeLostAsync(Guid sellerId, CancellationToken ct)
        => await AdjustAsync(sellerId, await _config.GetIntAsync(ConfigKeys.TrustDisputeLost, -10, ct), "thua tranh chấp", true, ct);

    public async Task OnLateDeliveryAsync(Guid sellerId, CancellationToken ct)
        => await AdjustAsync(sellerId, await _config.GetIntAsync(ConfigKeys.TrustLateDelivery, -5, ct), "trễ bàn giao", true, ct);

    public async Task OnViolationAsync(Guid sellerId, CancellationToken ct)
        => await AdjustAsync(sellerId, await _config.GetIntAsync(ConfigKeys.TrustViolation, -15, ct), "vi phạm bị xác minh", true, ct);

    /// <summary>Cộng bonus cho seller sạch ≥30 ngày (gọi bởi worker). Tự lưu.</summary>
    public async Task<int> Award30dCleanBonusAsync(CancellationToken ct)
    {
        var bonus = await _config.GetIntAsync(ConfigKeys.TrustClean30dBonus, 5, ct);
        if (bonus == 0) return 0;
        var now = DateTime.UtcNow;
        var cutoff = now.AddDays(-30);
        var sellers = await _db.Sellers
            .Where(s => s.TrustScore < 100
                && (s.LastViolationAt == null || s.LastViolationAt <= cutoff)
                && (s.LastTrustBonusAt == null || s.LastTrustBonusAt <= cutoff)
                && s.JoinedAt <= cutoff)
            .ToListAsync(ct);
        if (sellers.Count == 0) return 0;
        foreach (var s in sellers)
        {
            var before = s.TrustScore;
            s.TrustScore = Math.Clamp(s.TrustScore + bonus, 0, 100);
            s.LastTrustBonusAt = now;
            _db.AuditLogs.Add(new AuditLog
            {
                ActorRole = "System", Action = "trust_bonus_30d", EntityType = "Seller",
                EntityId = s.Id.ToString(), Amount = bonus,
                Detail = $"Trust {before}→{s.TrustScore} (30 ngày không vi phạm)",
            });
        }
        await _db.SaveChangesAsync(ct);
        return sellers.Count;
    }
}
