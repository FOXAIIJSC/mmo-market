using Microsoft.EntityFrameworkCore;
using MmoMarket.Application.Common;
using MmoMarket.Domain.Entities;
using MmoMarket.Domain.Enums;

namespace MmoMarket.Application.Reviews;

public record ReviewCreateDto(Guid OrderId, Guid ProductId, int Rating, string Comment);

public record OwnReviewDto(Guid Id, Guid ProductId, string ProductTitle, int Rating, string Comment, DateTime CreatedAt, string? Reply);

public class ReviewService
{
    private readonly IAppDbContext _db;
    public ReviewService(IAppDbContext db) => _db = db;

    public async Task<OwnReviewDto> CreateAsync(Guid userId, ReviewCreateDto dto, CancellationToken ct)
    {
        if (dto.Rating < 1 || dto.Rating > 5) throw new AppException("Rating phải từ 1-5");
        if (string.IsNullOrWhiteSpace(dto.Comment)) throw new AppException("Vui lòng nhập nhận xét");

        var order = await _db.Orders.Include(o => o.Lines).FirstOrDefaultAsync(o => o.Id == dto.OrderId && o.BuyerId == userId, ct)
            ?? throw new AppException("Không tìm thấy đơn", 404);
        if (order.Status != OrderStatus.Completed && order.Status != OrderStatus.Delivered)
            throw new AppException("Chỉ review đơn đã giao/hoàn thành");
        if (!order.Lines.Any(l => l.ProductId == dto.ProductId))
            throw new AppException("Sản phẩm không thuộc đơn này");

        var existing = await _db.Reviews.FirstOrDefaultAsync(r => r.OrderId == dto.OrderId && r.ProductId == dto.ProductId && r.UserId == userId, ct);
        Review review;
        if (existing != null)
        {
            existing.Rating = dto.Rating;
            existing.Comment = dto.Comment;
            review = existing;
        }
        else
        {
            review = new Review
            {
                OrderId = dto.OrderId,
                ProductId = dto.ProductId,
                UserId = userId,
                Rating = dto.Rating,
                Comment = dto.Comment,
            };
            _db.Reviews.Add(review);
        }

        // Recompute product rating + count
        var productReviews = await _db.Reviews.Where(r => r.ProductId == dto.ProductId).ToListAsync(ct);
        if (existing == null) productReviews.Add(review);
        var product = await _db.Products.FirstOrDefaultAsync(p => p.Id == dto.ProductId, ct);
        if (product != null)
        {
            product.ReviewCount = productReviews.Count;
            product.Rating = Math.Round(productReviews.Average(r => (double)r.Rating), 2);
            // Bump seller rating too
            var seller = await _db.Sellers.FirstOrDefaultAsync(s => s.Id == product.SellerId, ct);
            if (seller != null)
            {
                var sellerProductIds = await _db.Products.Where(p => p.SellerId == seller.Id).Select(p => p.Id).ToListAsync(ct);
                var sellerReviews = await _db.Reviews.Where(r => sellerProductIds.Contains(r.ProductId)).ToListAsync(ct);
                seller.ReviewCount = sellerReviews.Count;
                seller.Rating = sellerReviews.Count == 0 ? 0 : Math.Round(sellerReviews.Average(r => (double)r.Rating), 2);
            }
        }

        await _db.SaveChangesAsync(ct);

        return new OwnReviewDto(review.Id, review.ProductId, product?.Title ?? "", review.Rating, review.Comment, review.CreatedAt, review.Reply);
    }

    public async Task<OwnReviewDto[]> GetMineAsync(Guid userId, CancellationToken ct)
    {
        var reviews = await _db.Reviews.Include(r => r.Product).Where(r => r.UserId == userId).OrderByDescending(r => r.CreatedAt).ToListAsync(ct);
        return reviews.Select(r => new OwnReviewDto(r.Id, r.ProductId, r.Product?.Title ?? "", r.Rating, r.Comment, r.CreatedAt, r.Reply)).ToArray();
    }
}
