using MmoMarket.Domain.Common;

namespace MmoMarket.Domain.Entities;

public class DisputeMessage : Entity
{
    public Guid DisputeId { get; set; }
    public Dispute? Dispute { get; set; }
    public Guid AuthorUserId { get; set; }
    public User? Author { get; set; }
    public string AuthorRole { get; set; } = ""; // Buyer | Seller | Admin
    public string Body { get; set; } = "";
}
