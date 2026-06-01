using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using MmoMarket.Application.Common;
using MmoMarket.Application.Config;
using MmoMarket.Application.Coupons;
using MmoMarket.Domain.Entities;
using MmoMarket.Domain.Enums;

namespace MmoMarket.Application.Orders;

public record CheckoutDto(string PaymentMethod, string? Note, string? CouponCode);
public record OrderLineDto(Guid Id, Guid ProductId, string Title, decimal UnitPrice, int Quantity, string Delivery, string[]? DeliveredItems);
public record OrderDto(
    Guid Id,
    string Code,
    string Status,
    string PaymentMethod,
    decimal Subtotal,
    decimal Discount,
    decimal Fee,
    decimal Total,
    DateTime CreatedAt,
    DateTime? PaidAt,
    DateTime? DeliveredAt,
    DateTime? EscrowReleaseAt,
    DateTime? CompletedAt,
    OrderLineDto[] Lines);

public class OrderService
{
    private readonly IAppDbContext _db;
    private readonly CouponService _coupon;
    private readonly ConfigService _config;
    public OrderService(IAppDbContext db, CouponService coupon, ConfigService config) { _db = db; _coupon = coupon; _config = config; }

    public async Task<OrderDto> CheckoutAsync(Guid userId, CheckoutDto dto, CancellationToken ct)
    {
        if (!Enum.TryParse<PaymentMethod>(dto.PaymentMethod, true, out var method))
            throw new AppException("Phương thức thanh toán không hợp lệ");

        var cartItems = await _db.CartItems
            .Include(c => c.Product)!.ThenInclude(p => p!.Seller)
            .Where(c => c.UserId == userId)
            .ToListAsync(ct);
        if (cartItems.Count == 0) throw new AppException("Giỏ hàng trống");

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId, ct)
            ?? throw new AppException("User không tồn tại", 404);

        var subtotal = cartItems.Sum(c => c.Product!.Price * c.Quantity);
        var fee = 0m;
        var discount = 0m;
        if (!string.IsNullOrWhiteSpace(dto.CouponCode))
        {
            var v = await _coupon.ValidateAsync(userId, dto.CouponCode, subtotal, ct);
            if (!v.Valid) throw new AppException(v.Error ?? "Mã giảm giá không hợp lệ");
            discount = v.Discount;
        }
        var total = subtotal - discount + fee;

        if (method == PaymentMethod.Wallet)
        {
            if (user.WalletBalance < total) throw new AppException("Số dư ví không đủ");
        }

        var order = new Order
        {
            Code = "MMK-" + DateTime.UtcNow.Ticks.ToString()[^7..],
            BuyerId = userId,
            Status = method == PaymentMethod.Wallet ? OrderStatus.Paid : OrderStatus.PendingPayment,
            PaymentMethod = method,
            Subtotal = subtotal,
            Discount = discount,
            Fee = fee,
            Total = total,
            Note = dto.Note,
            PaidAt = method == PaymentMethod.Wallet ? DateTime.UtcNow : null,
        };

        foreach (var c in cartItems)
        {
            var p = c.Product!;
            order.Lines.Add(new OrderLine
            {
                ProductId = p.Id,
                SellerId = p.SellerId,
                Title = p.Title,
                UnitPrice = p.Price,
                Quantity = c.Quantity,
                Delivery = p.Delivery,
            });
        }

        _db.Orders.Add(order);

        if (method == PaymentMethod.Wallet)
        {
            user.WalletBalance -= total;
            _db.WalletTxns.Add(new WalletTxn
            {
                UserId = userId,
                Type = WalletTxnType.Purchase,
                Amount = -total,
                Status = WalletTxnStatus.Completed,
                Note = $"Thanh toán đơn {order.Code}",
                OrderId = order.Id,
            });
            await ProcessPaidOrderAsync(order, ct);
        }

        _db.CartItems.RemoveRange(cartItems);
        await _db.SaveChangesAsync(ct);

        if (!string.IsNullOrWhiteSpace(dto.CouponCode))
            await _coupon.RecordUsageAsync(userId, dto.CouponCode, order.Id, ct);

        return await GetByIdInternalAsync(order.Id, ct) ?? throw new AppException("Lỗi tạo đơn");
    }

    public async Task<OrderDto> SimulatePayAsync(Guid userId, Guid orderId, CancellationToken ct)
    {
        var order = await _db.Orders.Include(o => o.Lines).FirstOrDefaultAsync(o => o.Id == orderId && o.BuyerId == userId, ct)
            ?? throw new AppException("Không tìm thấy đơn", 404);
        if (order.Status != OrderStatus.PendingPayment) throw new AppException("Đơn không cần thanh toán");
        order.Status = OrderStatus.Paid;
        order.PaidAt = DateTime.UtcNow;
        await ProcessPaidOrderAsync(order, ct);
        await _db.SaveChangesAsync(ct);
        return await GetByIdInternalAsync(order.Id, ct)!;
    }

    private async Task ProcessPaidOrderAsync(Order order, CancellationToken ct)
    {
        var allAuto = order.Lines.All(l => l.Delivery == DeliveryMethod.Auto);
        if (allAuto)
        {
            foreach (var line in order.Lines)
            {
                var fakeAccount = $"acct{Random.Shared.Next(1000, 9999)}@deliv.local";
                line.DeliveredItemsJson = JsonSerializer.Serialize(new[] {
                    new { account = fakeAccount, password = Guid.NewGuid().ToString("N")[..10], note = "Vui lòng đổi mật khẩu trong 24h." }
                });
            }
            order.Status = OrderStatus.Delivered;
            order.DeliveredAt = DateTime.UtcNow;
            order.EscrowReleaseAt = DateTime.UtcNow.AddDays(3);
        }
        else
        {
            order.Status = OrderStatus.Processing;
        }
        // Update sold counters & loyalty
        foreach (var line in order.Lines)
        {
            var product = await _db.Products.FirstOrDefaultAsync(p => p.Id == line.ProductId, ct);
            if (product != null) product.Sold += line.Quantity;
            var seller = await _db.Sellers.FirstOrDefaultAsync(s => s.Id == line.SellerId, ct);
            if (seller != null) seller.TotalSold += line.Quantity;
        }
        var buyer = await _db.Users.FirstOrDefaultAsync(u => u.Id == order.BuyerId, ct);
        if (buyer != null)
        {
            var ptsRate = await _config.GetIntAsync(ConfigKeys.LoyaltyPtsPer1000, 1, ct);
            buyer.LoyaltyPoints += (int)(order.Total / 1000) * ptsRate;
        }
    }

    public async Task<OrderDto[]> GetMyOrdersAsync(Guid userId, string? status, CancellationToken ct)
    {
        var query = _db.Orders.Include(o => o.Lines).Where(o => o.BuyerId == userId);
        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<OrderStatus>(status, true, out var s))
            query = query.Where(o => o.Status == s);
        var orders = await query.OrderByDescending(o => o.CreatedAt).ToListAsync(ct);
        return orders.Select(Map).ToArray();
    }

    public async Task<OrderDto?> GetByIdAsync(Guid userId, Guid id, CancellationToken ct)
    {
        var order = await _db.Orders.Include(o => o.Lines).FirstOrDefaultAsync(o => o.Id == id && o.BuyerId == userId, ct);
        return order == null ? null : Map(order);
    }

    private async Task<OrderDto?> GetByIdInternalAsync(Guid id, CancellationToken ct)
    {
        var order = await _db.Orders.Include(o => o.Lines).FirstOrDefaultAsync(o => o.Id == id, ct);
        return order == null ? null : Map(order);
    }

    // Idempotent: called by MoMo IPN or return-URL verification to mark an external payment as paid.
    public async Task<bool> ConfirmExternalPaymentAsync(Guid orderId, CancellationToken ct)
    {
        var order = await _db.Orders.Include(o => o.Lines)
            .FirstOrDefaultAsync(o => o.Id == orderId, ct);
        if (order == null) return false;
        if (order.Status != OrderStatus.PendingPayment) return true; // already confirmed

        order.Status = OrderStatus.Paid;
        order.PaidAt = DateTime.UtcNow;
        await ProcessPaidOrderAsync(order, ct);
        await _db.SaveChangesAsync(ct);
        return true;
    }

    public async Task<OrderDto> ConfirmReceivedAsync(Guid userId, Guid id, CancellationToken ct)
    {
        var order = await _db.Orders.Include(o => o.Lines).FirstOrDefaultAsync(o => o.Id == id && o.BuyerId == userId, ct)
            ?? throw new AppException("Không tìm thấy đơn", 404);
        if (order.Status != OrderStatus.Delivered) throw new AppException("Chỉ xác nhận đơn đã giao");
        order.Status = OrderStatus.Completed;
        order.CompletedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
        return Map(order);
    }

    public static OrderDto Map(Order o) => new(
        o.Id, o.Code, o.Status.ToString(), o.PaymentMethod.ToString(),
        o.Subtotal, o.Discount, o.Fee, o.Total,
        o.CreatedAt, o.PaidAt, o.DeliveredAt, o.EscrowReleaseAt, o.CompletedAt,
        o.Lines.Select(l => new OrderLineDto(
            l.Id, l.ProductId, l.Title, l.UnitPrice, l.Quantity, l.Delivery.ToString(),
            string.IsNullOrWhiteSpace(l.DeliveredItemsJson)
                ? null
                : new[] { l.DeliveredItemsJson })).ToArray());
}
