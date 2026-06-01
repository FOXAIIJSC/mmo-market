namespace MmoMarket.Domain.Entities;

public class ChatMessage
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ConversationId { get; set; }
    public Conversation? Conversation { get; set; }
    public Guid SenderId { get; set; }
    public string SenderName { get; set; } = "";
    public string SenderRole { get; set; } = "";   // "Buyer" | "Seller"
    public string Body { get; set; } = "";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
