using MmoMarket.Domain.Common;

namespace MmoMarket.Domain.Entities;

public class Seller : Entity
{
    public Guid UserId { get; set; }
    public User? User { get; set; }
    public string Username { get; set; } = "";
    public string DisplayName { get; set; } = "";
    public string AvatarColor { get; set; } = "#7c3aed";
    public double Rating { get; set; }
    public int ReviewCount { get; set; }
    public int TotalSold { get; set; }
    public string? Badge { get; set; } // verified | top | new
    public string? Bio { get; set; }
    public string? ResponseTime { get; set; }
    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;

    public List<Product> Products { get; set; } = new();
}
