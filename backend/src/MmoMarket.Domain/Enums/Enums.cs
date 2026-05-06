namespace MmoMarket.Domain.Enums;

public enum UserRole
{
    Buyer = 0,
    Seller = 1,
    Ctv = 2,
    Admin = 8,
    SuperAdmin = 9
}

public enum DeliveryMethod
{
    Auto = 0,
    Manual = 1,
    Hybrid = 2
}

public enum OrderStatus
{
    PendingPayment = 0,
    Paid = 1,
    Processing = 2,
    Delivered = 3,
    Completed = 4,
    Dispute = 5,
    Refunded = 6,
    Cancelled = 7
}

public enum PaymentMethod
{
    Wallet = 0,
    VietQr = 1,
    Momo = 2,
    ZaloPay = 3,
    VnPay = 4,
    Usdt = 5,
    Btc = 6
}

public enum KycStatus
{
    None = 0,
    Pending = 1,
    Approved = 2,
    Rejected = 3
}

public enum WalletTxnType
{
    Topup = 0,
    Purchase = 1,
    Refund = 2,
    Withdraw = 3,
    Commission = 4,
    Bonus = 5
}

public enum WalletTxnStatus
{
    Pending = 0,
    Completed = 1,
    Failed = 2
}

public enum DisputeStatus
{
    Open = 0,
    Investigating = 1,
    Resolved = 2,
    Closed = 3
}

public enum ProductStatus
{
    Draft = 0,
    Pending = 1,
    Active = 2,
    Rejected = 3,
    Hidden = 4,
    OutOfStock = 5
}
