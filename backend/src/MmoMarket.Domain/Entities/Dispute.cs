using MmoMarket.Domain.Common;
using MmoMarket.Domain.Enums;

namespace MmoMarket.Domain.Entities;

public class Dispute : Entity
{
    public string Code { get; set; } = ""; // DSP-xxx
    public Guid OrderId { get; set; }
    public Order? Order { get; set; }
    public Guid BuyerId { get; set; }
    public Guid SellerId { get; set; }
    public string Title { get; set; } = "";
    public string Body { get; set; } = "";
    public DisputeStatus Status { get; set; } = DisputeStatus.Open;
    public string? Resolution { get; set; }
    public DateTime SlaUntil { get; set; }
}
