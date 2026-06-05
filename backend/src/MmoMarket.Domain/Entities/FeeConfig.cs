using MmoMarket.Domain.Common;

namespace MmoMarket.Domain.Entities;

/// <summary>
/// Cấu hình phí giao dịch động theo danh mục + ngưỡng giá (§6.1 tài liệu).
/// Quy tắc khớp: CategorySlug == danh mục (hoặc "" = mặc định toàn sàn),
/// và MinPrice &lt;= đơn giá &lt; (MaxPrice ?? vô cực). Dòng cụ thể hơn (đúng danh mục,
/// dải giá hẹp hơn) được ưu tiên.
/// </summary>
public class FeeConfig : Entity
{
    public string CategorySlug { get; set; } = "";   // "" = mặc định fallback cho mọi danh mục
    public decimal MinPrice { get; set; } = 0m;        // áp dụng khi đơn giá >= MinPrice
    public decimal? MaxPrice { get; set; }             // áp dụng khi đơn giá < MaxPrice; null = không giới hạn trên
    public decimal SellerFeePercent { get; set; }      // % phí thu của seller (vd 8 = 8%)
    public string? Note { get; set; }
}
