namespace MmoMarket.Domain.Entities;

public class SiteConfig
{
    public string Key { get; set; } = "";
    public string Value { get; set; } = "";
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
