using Microsoft.EntityFrameworkCore;
using MmoMarket.Application.Common;
using MmoMarket.Domain.Entities;
using MmoMarket.Domain.Enums;

namespace MmoMarket.Application.Sellers;

public record KycSubmitDto(string FullName, string IdNumber, string Address, string PhoneNumber);
public record KycDto(Guid Id, string Status, string FullName, string IdNumber, string Address, string PhoneNumber, DateTime CreatedAt, string? RejectionReason);

public class KycService
{
    private readonly IAppDbContext _db;
    public KycService(IAppDbContext db) => _db = db;

    public async Task<KycDto> SubmitAsync(Guid userId, KycSubmitDto dto, CancellationToken ct)
    {
        var existing = await _db.KycSubmissions.Where(k => k.UserId == userId).OrderByDescending(k => k.CreatedAt).FirstOrDefaultAsync(ct);
        if (existing != null && existing.Status == KycStatus.Approved)
            throw new AppException("KYC đã được duyệt");
        var sub = new KycSubmission
        {
            UserId = userId,
            FullName = dto.FullName,
            IdNumber = dto.IdNumber,
            Address = dto.Address,
            PhoneNumber = dto.PhoneNumber,
            Status = KycStatus.Pending,
        };
        _db.KycSubmissions.Add(sub);
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId, ct);
        if (user != null) user.KycStatus = KycStatus.Pending;
        await _db.SaveChangesAsync(ct);
        return Map(sub);
    }

    public async Task<KycDto?> GetMineAsync(Guid userId, CancellationToken ct)
    {
        var sub = await _db.KycSubmissions.Where(k => k.UserId == userId).OrderByDescending(k => k.CreatedAt).FirstOrDefaultAsync(ct);
        return sub == null ? null : Map(sub);
    }

    public async Task<KycDto[]> ListPendingAsync(CancellationToken ct)
    {
        var subs = await _db.KycSubmissions.Where(k => k.Status == KycStatus.Pending).OrderBy(k => k.CreatedAt).ToListAsync(ct);
        return subs.Select(Map).ToArray();
    }

    public async Task<KycDto> ApproveAsync(Guid id, CancellationToken ct)
    {
        var sub = await _db.KycSubmissions.FirstOrDefaultAsync(k => k.Id == id, ct)
            ?? throw new AppException("Không tìm thấy hồ sơ", 404);
        sub.Status = KycStatus.Approved;
        sub.ReviewedAt = DateTime.UtcNow;
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == sub.UserId, ct);
        if (user != null)
        {
            user.KycStatus = KycStatus.Approved;
            user.Role = Domain.Enums.UserRole.Seller;
            // ensure seller record exists
            var seller = await _db.Sellers.FirstOrDefaultAsync(s => s.UserId == user.Id, ct);
            if (seller == null)
            {
                _db.Sellers.Add(new Seller
                {
                    UserId = user.Id,
                    Username = user.Username,
                    DisplayName = user.DisplayName,
                    AvatarColor = user.AvatarColor,
                    Badge = "verified",
                    JoinedAt = DateTime.UtcNow,
                });
            }
        }
        await _db.SaveChangesAsync(ct);
        return Map(sub);
    }

    public async Task<KycDto> RejectAsync(Guid id, string reason, CancellationToken ct)
    {
        var sub = await _db.KycSubmissions.FirstOrDefaultAsync(k => k.Id == id, ct)
            ?? throw new AppException("Không tìm thấy hồ sơ", 404);
        sub.Status = KycStatus.Rejected;
        sub.RejectionReason = reason;
        sub.ReviewedAt = DateTime.UtcNow;
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == sub.UserId, ct);
        if (user != null) user.KycStatus = KycStatus.Rejected;
        await _db.SaveChangesAsync(ct);
        return Map(sub);
    }

    public static KycDto Map(KycSubmission k) => new(k.Id, k.Status.ToString(), k.FullName, k.IdNumber, k.Address, k.PhoneNumber, k.CreatedAt, k.RejectionReason);
}
