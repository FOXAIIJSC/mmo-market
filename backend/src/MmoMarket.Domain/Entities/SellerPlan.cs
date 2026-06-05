using MmoMarket.Domain.Common;

namespace MmoMarket.Domain.Entities;

/// <summary>
/// Gói thành viên Seller (§6.3 tài liệu): Free / Basic / Pro / VIP.
/// Quy định giá tháng, mức giảm phí, hạn mức tin đăng, lượt boost, badge.
/// </summary>
public class SellerPlan : Entity
{
    public string Code { get; set; } = "";            // free | basic | pro | vip (khóa định danh)
    public string Name { get; set; } = "";
    public decimal PricePerMonth { get; set; }         // VND/tháng (0 = miễn phí)
    public decimal FeeDiscountPercent { get; set; }    // % giảm tương đối trên phí danh mục (vd 60 = giảm 60%)
    public int MaxListings { get; set; } = -1;          // số tin đăng tối đa (-1 = không giới hạn)
    public int BoostsPerMonth { get; set; }
    public string? Badge { get; set; }                 // badge hiển thị (verified | top ...)
    public int Position { get; set; }
    public bool IsActive { get; set; } = true;
}
