using MmoMarket.Domain.Enums;

namespace MmoMarket.Domain.Entities;

public class SellerCoupon
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid SellerId { get; set; }
    public Seller? Seller { get; set; }
    public string Code { get; set; } = "";
    public string Description { get; set; } = "";
    public CouponType Type { get; set; } = CouponType.Percent;
    public decimal Value { get; set; }
    public decimal MinOrderAmount { get; set; }
    public decimal? MaxDiscount { get; set; }
    public int MaxUses { get; set; }
    public int UsedCount { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
