using MmoMarket.Application.Orders;
using MmoMarket.Application.Sellers;

namespace MmoMarket.Api.BackgroundJobs;

/// <summary>
/// Worker định kỳ xử lý timeout đơn hàng:
///  - Tự động giải ngân (escrow auto-release) khi buyer hết hạn kiểm tra.
///  - Tự động hủy + hoàn 100% khi seller không bàn giao đúng hạn.
/// </summary>
public class OrderEscrowWorker : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<OrderEscrowWorker> _logger;
    private static readonly TimeSpan Interval = TimeSpan.FromMinutes(1);

    public OrderEscrowWorker(IServiceScopeFactory scopeFactory, ILogger<OrderEscrowWorker> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        // Chờ app khởi động + DB seed xong rồi mới bắt đầu quét.
        try { await Task.Delay(TimeSpan.FromSeconds(15), stoppingToken); }
        catch (OperationCanceledException) { return; }

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var orders = scope.ServiceProvider.GetRequiredService<OrderService>();
                var trust = scope.ServiceProvider.GetRequiredService<TrustScoreService>();
                var released = await orders.AutoReleaseEscrowAsync(stoppingToken);
                var cancelled = await orders.AutoCancelStaleAsync(stoppingToken);
                var bonused = await trust.Award30dCleanBonusAsync(stoppingToken);
                if (released > 0 || cancelled > 0 || bonused > 0)
                    _logger.LogInformation("OrderEscrowWorker: giải ngân {Released} đơn, hủy {Cancelled} đơn, +trust {Bonused} seller", released, cancelled, bonused);
            }
            catch (OperationCanceledException) { break; }
            catch (Exception ex)
            {
                _logger.LogError(ex, "OrderEscrowWorker lỗi khi xử lý timeout đơn hàng");
            }

            try { await Task.Delay(Interval, stoppingToken); }
            catch (OperationCanceledException) { break; }
        }
    }
}
