using MmoMarket.Domain.Common;
using MmoMarket.Domain.Enums;

namespace MmoMarket.Domain.Entities;

public class Coupon : Entity
{
    public string Code { get; set; } = "";
    public string Description { get; set; } = "";
    public CouponType Type { get; set; }
    public decimal Value { get; set; }              // % or fixed VND
    public decimal MinOrderAmount { get; set; }     // 0 = no minimum
    public decimal? MaxDiscount { get; set; }       // cap for percent type
    public int MaxUses { get; set; }                // 0 = unlimited
    public int UsedCount { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public bool IsActive { get; set; } = true;

    public List<CouponUsage> Usages { get; set; } = new();
}
