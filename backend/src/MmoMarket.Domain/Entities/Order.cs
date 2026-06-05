using MmoMarket.Domain.Common;
using MmoMarket.Domain.Enums;

namespace MmoMarket.Domain.Entities;

public class Order : Entity
{
    public string Code { get; set; } = ""; // MMK-xxxxx
    public Guid BuyerId { get; set; }
    public User? Buyer { get; set; }
    public OrderStatus Status { get; set; } = OrderStatus.PendingPayment;
    public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.Wallet;
    public decimal Subtotal { get; set; }
    public decimal Discount { get; set; }
    public decimal Fee { get; set; }
    public decimal Total { get; set; }
    public DateTime? PaidAt { get; set; }
    public DateTime? DeliverDueAt { get; set; } // hạn seller phải bàn giao (T+2h), dùng cho auto-cancel
    public DateTime? DeliveredAt { get; set; }
    public DateTime? EscrowReleaseAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public string? Note { get; set; }

    public List<OrderLine> Lines { get; set; } = new();
}

public class OrderLine : Entity
{
    public Guid OrderId { get; set; }
    public Order? Order { get; set; }
    public Guid ProductId { get; set; }
    public Product? Product { get; set; }
    public Guid SellerId { get; set; }
    public string Title { get; set; } = "";
    public decimal UnitPrice { get; set; }
    public int Quantity { get; set; }
    public DeliveryMethod Delivery { get; set; }
    public string? DeliveredItemsJson { get; set; }
    public decimal FeeAmount { get; set; } // phí sàn thu trên line này, khóa tại thời điểm thanh toán (P1.1)
}
