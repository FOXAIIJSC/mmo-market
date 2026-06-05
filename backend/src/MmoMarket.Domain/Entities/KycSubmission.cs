using MmoMarket.Domain.Common;
using MmoMarket.Domain.Enums;

namespace MmoMarket.Domain.Entities;

public class KycSubmission : Entity
{
    public Guid UserId { get; set; }
    public User? User { get; set; }
    public string FullName { get; set; } = "";
    public string IdNumber { get; set; } = "";
    public string Address { get; set; } = "";
    public string PhoneNumber { get; set; } = "";
    public KycStatus Status { get; set; } = KycStatus.Pending;
    public string? RejectionReason { get; set; }
    public DateTime? ReviewedAt { get; set; }
    // Ảnh CCCD 2 mặt (P2.2) — lưu data URL/đường dẫn tham chiếu (object storage thật để sau)
    public string? FrontImage { get; set; }
    public string? BackImage { get; set; }
}
