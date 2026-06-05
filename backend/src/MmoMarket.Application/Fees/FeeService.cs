using Microsoft.EntityFrameworkCore;
using MmoMarket.Application.Common;
using MmoMarket.Application.Config;
using MmoMarket.Application.Sellers;

namespace MmoMarket.Application.Fees;

/// <summary>
/// Engine tính phí giao dịch động: phí theo danh mục + ngưỡng giá (FeeConfig),
/// sau đó áp mức giảm theo gói thành viên của seller (P1.1 + P1.2).
/// </summary>
public class FeeService
{
    private readonly IAppDbContext _db;
    private readonly ConfigService _config;
    private readonly SellerPlanService _plans;
    public FeeService(IAppDbContext db, ConfigService config, SellerPlanService plans)
    { _db = db; _config = config; _plans = plans; }

    /// <summary>% phí danh mục theo đơn giá (chưa giảm gói). Trả về phần trăm, vd 9 = 9%.</summary>
    public async Task<decimal> GetCategoryFeePercentAsync(string categorySlug, decimal unitPrice, CancellationToken ct)
    {
        var configs = await _db.FeeConfigs
            .Where(f => (f.CategorySlug == categorySlug || f.CategorySlug == "")
                && f.MinPrice <= unitPrice
                && (f.MaxPrice == null || unitPrice < f.MaxPrice))
            .ToListAsync(ct);

        if (configs.Count == 0)
        {
            // Fallback: phí phẳng cấu hình toàn sàn.
            var flat = await _config.GetDecimalAsync(ConfigKeys.FeeRate, 0.05m, ct);
            return flat * 100m;
        }

        // Ưu tiên dòng đúng danh mục (hơn fallback ""), rồi dải giá hẹp hơn (MinPrice lớn hơn).
        var best = configs
            .OrderByDescending(f => f.CategorySlug == categorySlug ? 1 : 0)
            .ThenByDescending(f => f.MinPrice)
            .First();
        return best.SellerFeePercent;
    }

    /// <summary>Tỷ lệ phí hiệu lực (0..1) cho 1 line, sau giảm theo gói của seller.</summary>
    public async Task<decimal> GetEffectiveRateAsync(string categorySlug, decimal unitPrice, Guid sellerId, CancellationToken ct)
    {
        var basePercent = await GetCategoryFeePercentAsync(categorySlug, unitPrice, ct);
        var plan = await _plans.GetEffectivePlanBySellerIdAsync(sellerId, ct);
        var effPercent = basePercent * (1m - plan.FeeDiscountPercent / 100m);
        if (effPercent < 0m) effPercent = 0m;
        return effPercent / 100m;
    }
}
