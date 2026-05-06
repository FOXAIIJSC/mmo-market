using MmoMarket.Domain.Common;

namespace MmoMarket.Domain.Entities;

public enum WithdrawStatus
{
    Pending = 0,
    Approved = 1,
    Rejected = 2,
    Paid = 3,
}

public class WithdrawRequest : Entity
{
    public Guid SellerUserId { get; set; }
    public User? SellerUser { get; set; }
    public decimal Amount { get; set; }
    public string Method { get; set; } = ""; // Bank / Momo / Usdt
    public string Account { get; set; } = ""; // bank account / phone / wallet address
    public WithdrawStatus Status { get; set; } = WithdrawStatus.Pending;
    public string? Note { get; set; }
    public string? AdminNote { get; set; }
    public DateTime? ProcessedAt { get; set; }
}
