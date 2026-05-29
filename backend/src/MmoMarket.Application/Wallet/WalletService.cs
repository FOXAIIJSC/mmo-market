using Microsoft.EntityFrameworkCore;
using MmoMarket.Application.Common;
using MmoMarket.Application.Notifications;
using MmoMarket.Domain.Entities;
using MmoMarket.Domain.Enums;

namespace MmoMarket.Application.Wallet;

public record TopupDto(decimal Amount, string Method);
public record WalletTxnDto(Guid Id, string Type, string Status, decimal Amount, string Note, DateTime CreatedAt);
public record WalletStateDto(decimal Balance, decimal HeldBalance, int LoyaltyPoints, WalletTxnDto[] Transactions);

public class WalletService
{
    private readonly IAppDbContext _db;
    private readonly NotificationService _notify;
    public WalletService(IAppDbContext db, NotificationService notify) { _db = db; _notify = notify; }

    public async Task<WalletStateDto> GetAsync(Guid userId, CancellationToken ct)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId, ct)
            ?? throw new AppException("User không tồn tại", 404);
        var txns = await _db.WalletTxns
            .Where(t => t.UserId == userId)
            .OrderByDescending(t => t.CreatedAt)
            .Take(50)
            .ToListAsync(ct);
        var heldTotals = await _db.Orders
            .Where(o => o.BuyerId == userId && (o.Status == OrderStatus.Paid || o.Status == OrderStatus.Processing || o.Status == OrderStatus.Delivered))
            .Select(o => o.Total)
            .ToListAsync(ct);
        var held = heldTotals.Sum();
        return new WalletStateDto(user.WalletBalance, held, user.LoyaltyPoints,
            txns.Select(t => new WalletTxnDto(t.Id, t.Type.ToString(), t.Status.ToString(), t.Amount, t.Note, t.CreatedAt)).ToArray());
    }

    public async Task<WalletStateDto> TopupAsync(Guid userId, TopupDto dto, CancellationToken ct)
    {
        if (dto.Amount <= 0) throw new AppException("Số tiền không hợp lệ");
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId, ct)
            ?? throw new AppException("User không tồn tại", 404);
        user.WalletBalance += dto.Amount;
        _db.WalletTxns.Add(new WalletTxn
        {
            UserId = userId,
            Type = WalletTxnType.Topup,
            Amount = dto.Amount,
            Status = WalletTxnStatus.Completed,
            Note = $"Nạp ví qua {dto.Method}",
        });
        await _db.SaveChangesAsync(ct);
        await _notify.CreateAsync(userId, "wallet", "Nạp ví thành công",
            $"Số dư ví của bạn đã được cộng {dto.Amount:N0}₫ qua {dto.Method}.",
            "/account/wallet", ct);
        return await GetAsync(userId, ct);
    }
}
