namespace MmoMarket.Domain.Entities;

public class Banner
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Title { get; set; } = "";
    public string Subtitle { get; set; } = "";
    public string? LinkUrl { get; set; }
    public string BgColor { get; set; } = "#7c3aed";
    public string TextColor { get; set; } = "#ffffff";
    public int Position { get; set; }
    public bool IsActive { get; set; } = true;
    public int ClickCount { get; set; }
    public DateTime? StartsAt { get; set; }
    public DateTime? EndsAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
