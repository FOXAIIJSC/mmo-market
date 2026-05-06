using Microsoft.EntityFrameworkCore;
using MmoMarket.Application.Catalog;
using MmoMarket.Application.Common;

namespace MmoMarket.Application.Cart;

public record CartLineDto(Guid CartItemId, ProductListItemDto Product, int Quantity, decimal Subtotal);
public record CartDto(CartLineDto[] Lines, decimal Subtotal, int TotalItems);
public record AddCartDto(Guid ProductId, int Quantity);
public record UpdateCartDto(int Quantity);

public class CartService
{
    private readonly IAppDbContext _db;
    public CartService(IAppDbContext db) => _db = db;

    public async Task<CartDto> GetAsync(Guid userId, CancellationToken ct)
    {
        var items = await _db.CartItems
            .Include(c => c.Product).ThenInclude(p => p!.Seller)
            .Where(c => c.UserId == userId)
            .ToListAsync(ct);
        var lines = items.Where(c => c.Product != null)
            .Select(c => new CartLineDto(c.Id, CatalogService.MapList(c.Product!), c.Quantity, c.Product!.Price * c.Quantity))
            .ToArray();
        return new CartDto(lines, lines.Sum(l => l.Subtotal), lines.Sum(l => l.Quantity));
    }

    public async Task<CartDto> AddAsync(Guid userId, AddCartDto dto, CancellationToken ct)
    {
        if (dto.Quantity <= 0) throw new AppException("Số lượng phải > 0");
        var product = await _db.Products.FirstOrDefaultAsync(p => p.Id == dto.ProductId, ct)
            ?? throw new AppException("Sản phẩm không tồn tại", 404);
        var existing = await _db.CartItems.FirstOrDefaultAsync(c => c.UserId == userId && c.ProductId == dto.ProductId, ct);
        if (existing != null) existing.Quantity += dto.Quantity;
        else _db.CartItems.Add(new Domain.Entities.CartItem
        {
            UserId = userId,
            ProductId = product.Id,
            Quantity = dto.Quantity,
        });
        await _db.SaveChangesAsync(ct);
        return await GetAsync(userId, ct);
    }

    public async Task<CartDto> UpdateAsync(Guid userId, Guid cartItemId, UpdateCartDto dto, CancellationToken ct)
    {
        var item = await _db.CartItems.FirstOrDefaultAsync(c => c.Id == cartItemId && c.UserId == userId, ct)
            ?? throw new AppException("Không tìm thấy item", 404);
        if (dto.Quantity <= 0) _db.CartItems.Remove(item);
        else item.Quantity = dto.Quantity;
        await _db.SaveChangesAsync(ct);
        return await GetAsync(userId, ct);
    }

    public async Task<CartDto> RemoveAsync(Guid userId, Guid cartItemId, CancellationToken ct)
    {
        var item = await _db.CartItems.FirstOrDefaultAsync(c => c.Id == cartItemId && c.UserId == userId, ct);
        if (item != null)
        {
            _db.CartItems.Remove(item);
            await _db.SaveChangesAsync(ct);
        }
        return await GetAsync(userId, ct);
    }
}
