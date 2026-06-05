using MmoMarket.Domain.Common;

namespace MmoMarket.Domain.Entities;

/// <summary>
/// Log bất biến (append-only) cho mọi thao tác tài chính/quan trọng.
/// Không được sửa hoặc xóa — guard trong AppDbContext.SaveChangesAsync.
/// </summary>
public class AuditLog : Entity
{
    public Guid? ActorUserId { get; set; }          // null = hệ thống (background job)
    public string ActorRole { get; set; } = "System"; // System | Buyer | Seller | Admin
    public string Action { get; set; } = "";         // vd: escrow_release, auto_cancel_refund, dispute_resolve, wallet_purchase
    public string EntityType { get; set; } = "";     // vd: Order, Wallet, Dispute
    public string? EntityId { get; set; }            // id/Code của thực thể liên quan
    public decimal? Amount { get; set; }             // số tiền liên quan (nếu có)
    public string? Detail { get; set; }              // mô tả/ghi chú chi tiết
}
