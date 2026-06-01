namespace MmoMarket.Domain.Entities;

public class Conversation
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid BuyerId { get; set; }
    public User? Buyer { get; set; }
    public Guid SellerId { get; set; }
    public Seller? Seller { get; set; }
    public string LastMessagePreview { get; set; } = "";
    public DateTime LastMessageAt { get; set; } = DateTime.UtcNow;
    public int BuyerUnreadCount { get; set; }
    public int SellerUnreadCount { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public List<ChatMessage> Messages { get; set; } = new();
}
