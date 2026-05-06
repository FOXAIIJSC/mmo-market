using Microsoft.EntityFrameworkCore;
using MmoMarket.Application.Common;
using MmoMarket.Domain.Enums;

namespace MmoMarket.Application.Admin;

public record AdminMetricsDto(
    decimal Gmv,
    decimal Revenue,
    int OrdersCompleted,
    int NewUsers,
    int KycPending,
    int ProductsPending,
    int OpenDisputes);

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
        return new AdminMetricsDto(gmv, revenue, ordersCompleted, newUsers, kyc, pending, disputes);
    }
}
