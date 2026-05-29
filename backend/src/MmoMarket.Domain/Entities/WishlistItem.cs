using MmoMarket.Domain.Common;

namespace MmoMarket.Domain.Entities;

public class WishlistItem : Entity
{
    public Guid UserId { get; set; }
    public Guid ProductId { get; set; }
    public Product? Product { get; set; }
}
