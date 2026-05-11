using Microsoft.EntityFrameworkCore;
using MmoMarket.Application.Common;
using MmoMarket.Application.Sellers;
using MmoMarket.Domain.Entities;
using MmoMarket.Domain.Enums;

namespace MmoMarket.Application.Admin;

public record AdminMetricsDto(
    decimal Gmv,
    decimal Revenue,
    int OrdersCompleted,
    int NewUsers,
    int KycPending,
    int ProductsPending,
    int OpenDisputes,
    int PendingWithdrawals);

public record AdminUserDto(Guid Id, string Email, string Username, string DisplayName, string Role, decimal WalletBalance, int LoyaltyPoints, string KycStatus, DateTime CreatedAt);
public record AdminProductDto(Guid Id, string Slug, string Title, string CategorySlug, decimal Price, int Stock, int Sold, double Rating, string Status, string SellerUsername, DateTime CreatedAt);
public record AdminWithdrawDto(Guid Id, Guid SellerUserId, string SellerUsername, decimal Amount, string Method, string Account, string Status, string? Note, string? AdminNote, DateTime CreatedAt, DateTime? ProcessedAt);
public record AdminWalletUserDto(Guid Id, string Email, string Username, string DisplayName, string Role, decimal WalletBalance, int LoyaltyPoints, int TxnCount, DateTime CreatedAt);
public record AdminWalletOverview(decimal TotalBalance, int TotalUsers, decimal TotalTopup, decimal TotalSpent, int PendingTopups);
public record AdminTopupDto(decimal Amount, string Note);
public record AdminWalletTxnDto(Guid Id, string Type, string Status, decimal Amount, string Note, DateTime CreatedAt);

public class AdminService
{
    private readonly IAppDbContext _db;
    public AdminService(IAppDbContext db) => _db = db;

    public async Task<AdminMetricsDto> GetMetricsAsync(CancellationToken ct)
    {
        var since = DateTime.UtcNow.AddDays(-30);
        var gmv = await _db.Orders.Where(o => o.CreatedAt >= since && o.Status != OrderStatus.Cancelled).SumAsync(o => (decimal?)o.Total, ct) ?? 0m;
        var revenue = gmv * 0.05m;
        var ordersCompleted = await _db.Orders.CountAsync(o => o.Status == OrderStatus.Completed, ct);
        var newUsers = await _db.Users.CountAsync(u => u.CreatedAt >= since, ct);
        var kyc = await _db.KycSubmissions.CountAsync(k => k.Status == KycStatus.Pending, ct);
        var pending = await _db.Products.CountAsync(p => p.Status == ProductStatus.Pending, ct);
        var disputes = await _db.Disputes.CountAsync(d => d.Status == DisputeStatus.Open || d.Status == DisputeStatus.Investigating, ct);
        var pendingWd = await _db.WithdrawRequests.CountAsync(w => w.Status == WithdrawStatus.Pending, ct);
        return new AdminMetricsDto(gmv, revenue, ordersCompleted, newUsers, kyc, pending, disputes, pendingWd);
    }

    public async Task<AdminUserDto[]> ListUsersAsync(string? role, CancellationToken ct)
    {
        var query = _db.Users.AsQueryable();
        if (!string.IsNullOrWhiteSpace(role) && Enum.TryParse<UserRole>(role, true, out var r))
            query = query.Where(u => u.Role == r);
        var users = await query.OrderByDescending(u => u.CreatedAt).Take(200).ToListAsync(ct);
        return users.Select(u => new AdminUserDto(u.Id, u.Email, u.Username, u.DisplayName, u.Role.ToString(), u.WalletBalance, u.LoyaltyPoints, u.KycStatus.ToString(), u.CreatedAt)).ToArray();
    }

    public async Task<AdminProductDto[]> ListProductsAsync(string? status, CancellationToken ct)
    {
        var query = _db.Products.Include(p => p.Seller).ThenInclude(s => s!.User).AsQueryable();
        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<ProductStatus>(status, true, out var st))
            query = query.Where(p => p.Status == st);
        var products = await query.OrderByDescending(p => p.CreatedAt).Take(200).ToListAsync(ct);
        return products.Select(p => new AdminProductDto(
            p.Id, p.Slug, p.Title, p.CategorySlug, p.Price, p.Stock, p.Sold, p.Rating,
            p.Status.ToString(), p.Seller?.Username ?? "", p.CreatedAt)).ToArray();
    }

    public async Task<AdminProductDto> ApproveProductAsync(Guid productId, CancellationToken ct)
    {
        var product = await _db.Products.Include(p => p.Seller).FirstOrDefaultAsync(p => p.Id == productId, ct)
            ?? throw new AppException("Không tìm thấy sản phẩm", 404);
        product.Status = ProductStatus.Active;
        await _db.SaveChangesAsync(ct);
        return new AdminProductDto(product.Id, product.Slug, product.Title, product.CategorySlug, product.Price, product.Stock, product.Sold, product.Rating, product.Status.ToString(), product.Seller?.Username ?? "", product.CreatedAt);
    }

    public async Task<AdminProductDto> RejectProductAsync(Guid productId, string reason, CancellationToken ct)
    {
        var product = await _db.Products.Include(p => p.Seller).FirstOrDefaultAsync(p => p.Id == productId, ct)
            ?? throw new AppException("Không tìm thấy sản phẩm", 404);
        product.Status = ProductStatus.Rejected;
        product.Description = string.IsNullOrEmpty(reason) ? product.Description : $"[REJECTED: {reason}]\n{product.Description}";
        await _db.SaveChangesAsync(ct);
        return new AdminProductDto(product.Id, product.Slug, product.Title, product.CategorySlug, product.Price, product.Stock, product.Sold, product.Rating, product.Status.ToString(), product.Seller?.Username ?? "", product.CreatedAt);
    }

    public async Task<AdminWithdrawDto[]> ListWithdrawalsAsync(string? status, CancellationToken ct)
    {
        var query = _db.WithdrawRequests.Include(w => w.SellerUser).AsQueryable();
        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<WithdrawStatus>(status, true, out var s))
            query = query.Where(w => w.Status == s);
        var ws = await query.OrderByDescending(w => w.CreatedAt).Take(200).ToListAsync(ct);
        return ws.Select(w => new AdminWithdrawDto(
            w.Id, w.SellerUserId, w.SellerUser?.Username ?? "", w.Amount, w.Method, w.Account,
            w.Status.ToString(), w.Note, w.AdminNote, w.CreatedAt, w.ProcessedAt)).ToArray();
    }

    public async Task<AdminWithdrawDto> ProcessWithdrawAsync(Guid id, bool approve, string? adminNote, CancellationToken ct)
    {
        var w = await _db.WithdrawRequests.Include(x => x.SellerUser).FirstOrDefaultAsync(x => x.Id == id, ct)
            ?? throw new AppException("Không tìm thấy yêu cầu", 404);
        if (w.Status != WithdrawStatus.Pending) throw new AppException("Yêu cầu đã xử lý");
        w.Status = approve ? WithdrawStatus.Paid : WithdrawStatus.Rejected;
        w.AdminNote = adminNote;
        w.ProcessedAt = DateTime.UtcNow;
        if (approve)
        {
            _db.WalletTxns.Add(new WalletTxn
            {
                UserId = w.SellerUserId,
                Type = WalletTxnType.Withdraw,
                Amount = -w.Amount,
                Status = WalletTxnStatus.Completed,
                Note = $"Rút tiền — {w.Method} {w.Account}",
            });
        }
        await _db.SaveChangesAsync(ct);
        return new AdminWithdrawDto(w.Id, w.SellerUserId, w.SellerUser?.Username ?? "", w.Amount, w.Method, w.Account, w.Status.ToString(), w.Note, w.AdminNote, w.CreatedAt, w.ProcessedAt);
    }

    public async Task<AdminWalletOverview> GetWalletOverviewAsync(CancellationToken ct)
    {
        var totalBalance = await _db.Users.SumAsync(u => (decimal?)u.WalletBalance, ct) ?? 0m;
        var totalUsers = await _db.Users.CountAsync(u => u.WalletBalance > 0, ct);
        var totalTopup = await _db.WalletTxns
            .Where(t => t.Type == WalletTxnType.Topup && t.Status == WalletTxnStatus.Completed)
            .SumAsync(t => (decimal?)t.Amount, ct) ?? 0m;
        var totalSpent = await _db.WalletTxns
            .Where(t => t.Type == WalletTxnType.Purchase && t.Status == WalletTxnStatus.Completed)
            .SumAsync(t => (decimal?)t.Amount, ct) ?? 0m;
        var pendingTopups = await _db.WalletTxns
            .CountAsync(t => t.Type == WalletTxnType.Topup && t.Status == WalletTxnStatus.Pending, ct);
        return new AdminWalletOverview(totalBalance, totalUsers, totalTopup, Math.Abs(totalSpent), pendingTopups);
    }

    public async Task<AdminWalletUserDto[]> ListWalletUsersAsync(string? search, CancellationToken ct)
    {
        var query = _db.Users.AsQueryable();
        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(u => u.Username.Contains(search) || u.Email.Contains(search) || u.DisplayName.Contains(search));
        var users = await query.OrderByDescending(u => u.WalletBalance).Take(200).ToListAsync(ct);
        var userIds = users.Select(u => u.Id).ToList();
        var txnCounts = await _db.WalletTxns
            .Where(t => userIds.Contains(t.UserId))
            .GroupBy(t => t.UserId)
            .Select(g => new { UserId = g.Key, Count = g.Count() })
            .ToListAsync(ct);
        var countMap = txnCounts.ToDictionary(x => x.UserId, x => x.Count);
        return users.Select(u => new AdminWalletUserDto(
            u.Id, u.Email, u.Username, u.DisplayName, u.Role.ToString(),
            u.WalletBalance, u.LoyaltyPoints,
            countMap.GetValueOrDefault(u.Id, 0), u.CreatedAt)).ToArray();
    }

    public async Task<AdminWalletTxnDto[]> GetUserTransactionsAsync(Guid userId, CancellationToken ct)
    {
        var txns = await _db.WalletTxns
            .Where(t => t.UserId == userId)
            .OrderByDescending(t => t.CreatedAt)
            .Take(100)
            .ToListAsync(ct);
        return txns.Select(t => new AdminWalletTxnDto(
            t.Id, t.Type.ToString(), t.Status.ToString(), t.Amount, t.Note, t.CreatedAt)).ToArray();
    }

    public async Task<AdminWalletUserDto> AdminTopupAsync(Guid userId, AdminTopupDto dto, CancellationToken ct)
    {
        if (dto.Amount <= 0) throw new AppException("Số tiền không hợp lệ");
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId, ct)
            ?? throw new AppException("Không tìm thấy user", 404);
        user.WalletBalance += dto.Amount;
        _db.WalletTxns.Add(new WalletTxn
        {
            UserId = userId,
            Type = WalletTxnType.Topup,
            Amount = dto.Amount,
            Status = WalletTxnStatus.Completed,
            Note = string.IsNullOrWhiteSpace(dto.Note) ? "Admin nạp tiền" : dto.Note,
        });
        await _db.SaveChangesAsync(ct);
        var txnCount = await _db.WalletTxns.CountAsync(t => t.UserId == userId, ct);
        return new AdminWalletUserDto(user.Id, user.Email, user.Username, user.DisplayName, user.Role.ToString(), user.WalletBalance, user.LoyaltyPoints, txnCount, user.CreatedAt);
    }
}
