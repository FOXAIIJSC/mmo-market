using MmoMarket.Domain.Common;
using MmoMarket.Domain.Enums;

namespace MmoMarket.Domain.Entities;

public class WalletTxn : Entity
{
    public Guid UserId { get; set; }
    public User? User { get; set; }
    public WalletTxnType Type { get; set; }
    public WalletTxnStatus Status { get; set; } = WalletTxnStatus.Completed;
    public decimal Amount { get; set; }
    public string Note { get; set; } = "";
    public Guid? OrderId { get; set; }
}
