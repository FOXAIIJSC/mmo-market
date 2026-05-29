using MmoMarket.Domain.Common;

namespace MmoMarket.Domain.Entities;

public class Notification : Entity
{
    public Guid UserId { get; set; }
    public string Type { get; set; } = "";   // order|wallet|review|dispute|kyc|system
    public string Title { get; set; } = "";
    public string Body { get; set; } = "";
    public string? Link { get; set; }
    public bool IsRead { get; set; }
}
