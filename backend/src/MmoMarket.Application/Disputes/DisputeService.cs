using Microsoft.EntityFrameworkCore;
using MmoMarket.Application.Common;
using MmoMarket.Domain.Entities;
using MmoMarket.Domain.Enums;

namespace MmoMarket.Application.Disputes;

public record DisputeOpenDto(Guid OrderId, string Title, string Body);
public record DisputeMessageCreateDto(string Body);
public record DisputeResolveDto(string Resolution, string Action); // Action: refund_buyer | release_seller | partial_refund

public record DisputeMessageDto(Guid Id, Guid AuthorUserId, string AuthorName, string AuthorRole, string Body, DateTime CreatedAt);
public record DisputeListItemDto(Guid Id, string Code, Guid OrderId, string OrderCode, string Title, string Status, DateTime CreatedAt, DateTime SlaUntil, string? Resolution);
public record DisputeDetailDto(Guid Id, string Code, Guid OrderId, string OrderCode, Guid BuyerId, Guid SellerId, string Title, string Body, string Status, string? Resolution, DateTime SlaUntil, DateTime CreatedAt, DisputeMessageDto[] Messages);

public class DisputeService
{
    private readonly IAppDbContext _db;
    public DisputeService(IAppDbContext db) => _db = db;

    public async Task<DisputeDetailDto> OpenAsync(Guid userId, DisputeOpenDto dto, CancellationToken ct)
    {
        var order = await _db.Orders.Include(o => o.Lines).FirstOrDefaultAsync(o => o.Id == dto.OrderId && o.BuyerId == userId, ct)
            ?? throw new AppException("Không tìm thấy đơn", 404);
        if (order.Status != OrderStatus.Delivered && order.Status != OrderStatus.Processing && order.Status != OrderStatus.Paid)
            throw new AppException("Chỉ mở tranh chấp với đơn đã giao/đang xử lý");
        if (string.IsNullOrWhiteSpace(dto.Title) || string.IsNullOrWhiteSpace(dto.Body))
            throw new AppException("Vui lòng nhập tiêu đề và nội dung");
        var existing = await _db.Disputes.FirstOrDefaultAsync(d => d.OrderId == dto.OrderId && (d.Status == DisputeStatus.Open || d.Status == DisputeStatus.Investigating), ct);
        if (existing != null) throw new AppException("Đơn đã có tranh chấp đang mở");

        var sellerId = order.Lines.FirstOrDefault()?.SellerId ?? Guid.Empty;
        var dispute = new Dispute
        {
            Code = "DSP-" + DateTime.UtcNow.Ticks.ToString()[^7..],
            OrderId = order.Id,
            BuyerId = userId,
            SellerId = sellerId,
            Title = dto.Title,
            Body = dto.Body,
            Status = DisputeStatus.Open,
            SlaUntil = DateTime.UtcNow.AddDays(3),
        };
        _db.Disputes.Add(dispute);
        order.Status = OrderStatus.Dispute;
        // hold escrow release
        order.EscrowReleaseAt = null;
        // initial message
        _db.DisputeMessages.Add(new DisputeMessage
        {
            DisputeId = dispute.Id,
            AuthorUserId = userId,
            AuthorRole = "Buyer",
            Body = dto.Body,
        });
        await _db.SaveChangesAsync(ct);
        return await GetDetailAsync(dispute.Id, userId, isAdmin: false, ct) ?? throw new AppException("Lỗi tạo tranh chấp");
    }

    public async Task<DisputeMessageDto> AddMessageAsync(Guid userId, Guid disputeId, DisputeMessageCreateDto dto, bool isAdmin, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(dto.Body)) throw new AppException("Nội dung trống");
        var dispute = await _db.Disputes.FirstOrDefaultAsync(d => d.Id == disputeId, ct)
            ?? throw new AppException("Không tìm thấy tranh chấp", 404);
        var role = "Buyer";
        if (isAdmin) role = "Admin";
        else if (dispute.SellerId != Guid.Empty)
        {
            var seller = await _db.Sellers.FirstOrDefaultAsync(s => s.Id == dispute.SellerId, ct);
            if (seller?.UserId == userId) role = "Seller";
        }
        if (!isAdmin && dispute.BuyerId != userId)
        {
            var sellerOk = await _db.Sellers.AnyAsync(s => s.Id == dispute.SellerId && s.UserId == userId, ct);
            if (!sellerOk) throw new AppException("Không có quyền", 403);
        }
        var msg = new DisputeMessage
        {
            DisputeId = disputeId,
            AuthorUserId = userId,
            AuthorRole = role,
            Body = dto.Body,
        };
        _db.DisputeMessages.Add(msg);
        if (dispute.Status == DisputeStatus.Open && role == "Admin") dispute.Status = DisputeStatus.Investigating;
        await _db.SaveChangesAsync(ct);
        var author = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId, ct);
        return new DisputeMessageDto(msg.Id, userId, author?.DisplayName ?? "User", role, msg.Body, msg.CreatedAt);
    }

    public async Task<DisputeListItemDto[]> ListMineAsync(Guid userId, CancellationToken ct)
    {
        var disputes = await _db.Disputes
            .Include(d => d.Order)
            .Where(d => d.BuyerId == userId).OrderByDescending(d => d.CreatedAt).ToListAsync(ct);
        return disputes.Select(MapList).ToArray();
    }

    public async Task<DisputeListItemDto[]> ListAllAsync(string? status, CancellationToken ct)
    {
        var query = _db.Disputes.Include(d => d.Order).AsQueryable();
        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<DisputeStatus>(status, true, out var s))
            query = query.Where(d => d.Status == s);
        var disputes = await query.OrderByDescending(d => d.CreatedAt).ToListAsync(ct);
        return disputes.Select(MapList).ToArray();
    }

    public async Task<DisputeDetailDto?> GetDetailAsync(Guid disputeId, Guid userId, bool isAdmin, CancellationToken ct)
    {
        var dispute = await _db.Disputes.Include(d => d.Order).FirstOrDefaultAsync(d => d.Id == disputeId, ct);
        if (dispute == null) return null;
        if (!isAdmin)
        {
            var sellerOk = await _db.Sellers.AnyAsync(s => s.Id == dispute.SellerId && s.UserId == userId, ct);
            if (dispute.BuyerId != userId && !sellerOk) throw new AppException("Không có quyền", 403);
        }
        var messages = await _db.DisputeMessages.Include(m => m.Author).Where(m => m.DisputeId == disputeId).OrderBy(m => m.CreatedAt).ToListAsync(ct);
        return new DisputeDetailDto(
            dispute.Id, dispute.Code, dispute.OrderId, dispute.Order?.Code ?? "",
            dispute.BuyerId, dispute.SellerId, dispute.Title, dispute.Body,
            dispute.Status.ToString(), dispute.Resolution, dispute.SlaUntil, dispute.CreatedAt,
            messages.Select(m => new DisputeMessageDto(m.Id, m.AuthorUserId, m.Author?.DisplayName ?? "", m.AuthorRole, m.Body, m.CreatedAt)).ToArray());
    }

    public async Task<DisputeDetailDto> ResolveAsync(Guid adminUserId, Guid disputeId, DisputeResolveDto dto, CancellationToken ct)
    {
        var dispute = await _db.Disputes.Include(d => d.Order).ThenInclude(o => o!.Lines).FirstOrDefaultAsync(d => d.Id == disputeId, ct)
            ?? throw new AppException("Không tìm thấy tranh chấp", 404);
        if (dispute.Status == DisputeStatus.Resolved || dispute.Status == DisputeStatus.Closed)
            throw new AppException("Tranh chấp đã đóng");

        dispute.Status = DisputeStatus.Resolved;
        dispute.Resolution = dto.Resolution;

        var order = dispute.Order;
        var buyer = await _db.Users.FirstOrDefaultAsync(u => u.Id == dispute.BuyerId, ct);
        if (order != null && buyer != null)
        {
            switch (dto.Action)
            {
                case "refund_buyer":
                    buyer.WalletBalance += order.Total;
                    _db.WalletTxns.Add(new WalletTxn
                    {
                        UserId = buyer.Id,
                        Type = WalletTxnType.Refund,
                        Amount = order.Total,
                        Status = WalletTxnStatus.Completed,
                        Note = $"Hoàn tiền tranh chấp {dispute.Code} (đơn {order.Code})",
                        OrderId = order.Id,
                    });
                    order.Status = OrderStatus.Refunded;
                    break;
                case "release_seller":
                    order.Status = OrderStatus.Completed;
                    order.CompletedAt = DateTime.UtcNow;
                    break;
                case "partial_refund":
                    var half = order.Total / 2m;
                    buyer.WalletBalance += half;
                    _db.WalletTxns.Add(new WalletTxn
                    {
                        UserId = buyer.Id,
                        Type = WalletTxnType.Refund,
                        Amount = half,
                        Status = WalletTxnStatus.Completed,
                        Note = $"Hoàn 50% tranh chấp {dispute.Code} (đơn {order.Code})",
                        OrderId = order.Id,
                    });
                    order.Status = OrderStatus.Completed;
                    order.CompletedAt = DateTime.UtcNow;
                    break;
                default:
                    throw new AppException("Action không hợp lệ");
            }
        }

        _db.DisputeMessages.Add(new DisputeMessage
        {
            DisputeId = dispute.Id,
            AuthorUserId = adminUserId,
            AuthorRole = "Admin",
            Body = $"Tranh chấp đã được giải quyết: {dto.Resolution} (Action: {dto.Action})",
        });

        await _db.SaveChangesAsync(ct);
        return await GetDetailAsync(disputeId, adminUserId, isAdmin: true, ct) ?? throw new AppException("Lỗi");
    }

    private static DisputeListItemDto MapList(Dispute d) => new(
        d.Id, d.Code, d.OrderId, d.Order?.Code ?? "", d.Title, d.Status.ToString(),
        d.CreatedAt, d.SlaUntil, d.Resolution);
}
