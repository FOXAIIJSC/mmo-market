using Microsoft.EntityFrameworkCore;
using MmoMarket.Application.Common;
using MmoMarket.Domain.Entities;

namespace MmoMarket.Application.Messages;

public record ConversationDto(
    Guid Id, string OtherPartyName, string OtherPartyAvatarColor, string OtherPartyUsername,
    string LastMessagePreview, DateTime LastMessageAt, int UnreadCount);

public record ChatMessageDto(
    Guid Id, Guid SenderId, string SenderName, string SenderRole, string Body, DateTime CreatedAt);

public record StartConversationDto(string SellerUsername);
public record SendMessageDto(string Body);

public class MessageService
{
    private readonly IAppDbContext _db;
    public MessageService(IAppDbContext db) => _db = db;

    // ── Buyer ─────────────────────────────────────────────────────────────────
    public async Task<ConversationDto[]> ListBuyerConversationsAsync(Guid buyerId, CancellationToken ct)
    {
        var convs = await _db.Conversations
            .Include(c => c.Seller)
            .Where(c => c.BuyerId == buyerId)
            .OrderByDescending(c => c.LastMessageAt)
            .ToListAsync(ct);

        return convs.Select(c => new ConversationDto(
            c.Id,
            c.Seller?.DisplayName ?? c.Seller?.Username ?? "Shop",
            c.Seller?.AvatarColor ?? "#7c3aed",
            c.Seller?.Username ?? "",
            c.LastMessagePreview,
            c.LastMessageAt,
            c.BuyerUnreadCount
        )).ToArray();
    }

    public async Task<ConversationDto> GetOrCreateConversationAsync(Guid buyerId, string sellerUsername, CancellationToken ct)
    {
        var seller = await _db.Sellers.FirstOrDefaultAsync(s => s.Username == sellerUsername, ct)
            ?? throw new AppException("Không tìm thấy shop", 404);

        var conv = await _db.Conversations
            .Include(c => c.Seller)
            .FirstOrDefaultAsync(c => c.BuyerId == buyerId && c.SellerId == seller.Id, ct);

        if (conv == null)
        {
            conv = new Conversation { BuyerId = buyerId, SellerId = seller.Id };
            _db.Conversations.Add(conv);
            await _db.SaveChangesAsync(ct);
            conv.Seller = seller;
        }

        return new ConversationDto(
            conv.Id,
            seller.DisplayName ?? seller.Username,
            seller.AvatarColor,
            seller.Username,
            conv.LastMessagePreview,
            conv.LastMessageAt,
            conv.BuyerUnreadCount
        );
    }

    // ── Seller ────────────────────────────────────────────────────────────────
    public async Task<ConversationDto[]> ListSellerConversationsAsync(Guid userId, CancellationToken ct)
    {
        var seller = await _db.Sellers.FirstOrDefaultAsync(s => s.UserId == userId, ct)
            ?? throw new AppException("Bạn chưa là seller", 403);

        var convs = await _db.Conversations
            .Include(c => c.Buyer)
            .Where(c => c.SellerId == seller.Id)
            .OrderByDescending(c => c.LastMessageAt)
            .ToListAsync(ct);

        return convs.Select(c => new ConversationDto(
            c.Id,
            c.Buyer?.DisplayName ?? "(buyer)",
            c.Buyer?.AvatarColor ?? "#22d3ee",
            c.Buyer?.Username ?? "",
            c.LastMessagePreview,
            c.LastMessageAt,
            c.SellerUnreadCount
        )).ToArray();
    }

    // ── Shared: get messages + mark read ─────────────────────────────────────
    public async Task<ChatMessageDto[]> GetMessagesAsync(Guid conversationId, Guid userId, string role, CancellationToken ct)
    {
        var conv = await _db.Conversations
            .FirstOrDefaultAsync(c => c.Id == conversationId, ct)
            ?? throw new AppException("Không tìm thấy cuộc trò chuyện", 404);

        // Verify access
        bool isAuthorized = role == "Buyer"
            ? conv.BuyerId == userId
            : await _db.Sellers.AnyAsync(s => s.UserId == userId && s.Id == conv.SellerId, ct);
        if (!isAuthorized) throw new AppException("Không có quyền", 403);

        // Mark read
        if (role == "Buyer" && conv.BuyerUnreadCount > 0)
        {
            conv.BuyerUnreadCount = 0;
            await _db.SaveChangesAsync(ct);
        }
        else if (role == "Seller" && conv.SellerUnreadCount > 0)
        {
            conv.SellerUnreadCount = 0;
            await _db.SaveChangesAsync(ct);
        }

        var msgs = await _db.ChatMessages
            .Where(m => m.ConversationId == conversationId)
            .OrderBy(m => m.CreatedAt)
            .ToListAsync(ct);

        return msgs.Select(MapMessage).ToArray();
    }

    // ── Send message ──────────────────────────────────────────────────────────
    public async Task<ChatMessageDto> SendMessageAsync(Guid conversationId, Guid senderId, string senderRole, string body, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(body)) throw new AppException("Tin nhắn không được để trống");

        var conv = await _db.Conversations
            .FirstOrDefaultAsync(c => c.Id == conversationId, ct)
            ?? throw new AppException("Không tìm thấy cuộc trò chuyện", 404);

        // Verify access
        bool isAuthorized = senderRole == "Buyer"
            ? conv.BuyerId == senderId
            : await _db.Sellers.AnyAsync(s => s.UserId == senderId && s.Id == conv.SellerId, ct);
        if (!isAuthorized) throw new AppException("Không có quyền", 403);

        var sender = await _db.Users.FirstOrDefaultAsync(u => u.Id == senderId, ct);
        var senderName = senderRole == "Seller"
            ? (await _db.Sellers.FirstOrDefaultAsync(s => s.UserId == senderId, ct))?.DisplayName ?? sender?.DisplayName ?? "Seller"
            : sender?.DisplayName ?? "Buyer";

        var msg = new ChatMessage
        {
            ConversationId = conversationId,
            SenderId = senderId,
            SenderName = senderName,
            SenderRole = senderRole,
            Body = body.Trim(),
        };
        _db.ChatMessages.Add(msg);

        conv.LastMessagePreview = body.Length > 60 ? body[..60] + "…" : body;
        conv.LastMessageAt = DateTime.UtcNow;
        if (senderRole == "Buyer") conv.SellerUnreadCount++;
        else conv.BuyerUnreadCount++;

        await _db.SaveChangesAsync(ct);
        return MapMessage(msg);
    }

    private static ChatMessageDto MapMessage(ChatMessage m) =>
        new(m.Id, m.SenderId, m.SenderName, m.SenderRole, m.Body, m.CreatedAt);
}
