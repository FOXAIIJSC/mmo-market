namespace MmoMarket.Domain.Entities;

public class LoyaltyReward
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Title { get; set; } = "";
    public string Description { get; set; } = "";
    public int PointsCost { get; set; }
    public string Type { get; set; } = "Voucher";
    public decimal VoucherAmount { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsComingSoon { get; set; }
    public int Position { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
