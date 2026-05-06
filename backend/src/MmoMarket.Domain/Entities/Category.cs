using MmoMarket.Domain.Common;

namespace MmoMarket.Domain.Entities;

public class Category : Entity
{
    public string Slug { get; set; } = "";
    public string Name { get; set; } = "";
    public string Short { get; set; } = "";
    public string IconKey { get; set; } = "";
    public string Description { get; set; } = "";
    public string Color { get; set; } = "";
    public int Position { get; set; }

    public List<Product> Products { get; set; } = new();
}
