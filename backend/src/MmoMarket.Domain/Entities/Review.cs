using MmoMarket.Domain.Common;

namespace MmoMarket.Domain.Entities;

public class Review : Entity
{
    public Guid ProductId { get; set; }
    public Product? Product { get; set; }
    public Guid UserId { get; set; }
    public User? User { get; set; }
    public Guid? OrderId { get; set; }
    public int Rating { get; set; }
    public string Comment { get; set; } = "";
    public string? Reply { get; set; }
}
