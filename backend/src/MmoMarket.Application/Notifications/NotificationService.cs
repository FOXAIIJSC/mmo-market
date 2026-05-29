using Microsoft.EntityFrameworkCore;
using MmoMarket.Application.Common;
using MmoMarket.Domain.Entities;

namespace MmoMarket.Application.Notifications;

public record NotificationDto(
    Guid Id, string Type, string Title, string Body,
    string? Link, bool IsRead, DateTime CreatedAt);

public class NotificationService
{
    private readonly IAppDbContext _db;
    public NotificationService(IAppDbContext db) => _db = db;

    public async Task<NotificationDto[]> GetAsync(Guid userId, CancellationToken ct)
    {
        var items = await _db.Notifications
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .Take(50)
            .ToListAsync(ct);
        return items.Select(Map).ToArray();
    }

    public async Task<int> UnreadCountAsync(Guid userId, CancellationToken ct) =>
        await _db.Notifications.CountAsync(n => n.UserId == userId && !n.IsRead, ct);

    public async Task MarkReadAsync(Guid userId, Guid notificationId, CancellationToken ct)
    {
        var n = await _db.Notifications
            .FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId, ct);
        if (n is null || n.IsRead) return;
        n.IsRead = true;
        await _db.SaveChangesAsync(ct);
    }

    public async Task MarkAllReadAsync(Guid userId, CancellationToken ct)
    {
        var unread = await _db.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .ToListAsync(ct);
        if (unread.Count == 0) return;
        foreach (var n in unread) n.IsRead = true;
        await _db.SaveChangesAsync(ct);
    }

    public async Task CreateAsync(
        Guid userId, string type, string title, string body,
        string? link, CancellationToken ct)
    {
        _db.Notifications.Add(new Notification
        {
            UserId = userId,
            Type = type,
            Title = title,
            Body = body,
            Link = link,
        });
        await _db.SaveChangesAsync(ct);
    }

    private static NotificationDto Map(Notification n) =>
        new(n.Id, n.Type, n.Title, n.Body, n.Link, n.IsRead, n.CreatedAt);
}
