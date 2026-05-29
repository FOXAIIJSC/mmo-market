using MmoMarket.Domain.Common;

namespace MmoMarket.Domain.Entities;

public class CouponUsage : Entity
{
    public Guid CouponId { get; set; }
    public Coupon? Coupon { get; set; }
    public Guid UserId { get; set; }
    public Guid? OrderId { get; set; }
}
