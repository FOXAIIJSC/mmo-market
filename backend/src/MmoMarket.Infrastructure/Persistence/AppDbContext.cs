using Microsoft.EntityFrameworkCore;
using MmoMarket.Application.Common;
using MmoMarket.Domain.Common;
using MmoMarket.Domain.Entities;

namespace MmoMarket.Infrastructure.Persistence;

public class AppDbContext : DbContext, IAppDbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Seller> Sellers => Set<Seller>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<InventoryItem> InventoryItems => Set<InventoryItem>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderLine> OrderLines => Set<OrderLine>();
    public DbSet<CartItem> CartItems => Set<CartItem>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<WalletTxn> WalletTxns => Set<WalletTxn>();
    public DbSet<Dispute> Disputes => Set<Dispute>();
    public DbSet<DisputeMessage> DisputeMessages => Set<DisputeMessage>();
    public DbSet<KycSubmission> KycSubmissions => Set<KycSubmission>();
    public DbSet<WithdrawRequest> WithdrawRequests => Set<WithdrawRequest>();
    public DbSet<WishlistItem> WishlistItems => Set<WishlistItem>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<Coupon> Coupons => Set<Coupon>();
    public DbSet<CouponUsage> CouponUsages => Set<CouponUsage>();
    public DbSet<SellerCoupon> SellerCoupons => Set<SellerCoupon>();
    public DbSet<Banner> Banners => Set<Banner>();
    public DbSet<FlashSale> FlashSales => Set<FlashSale>();
    public DbSet<SiteConfig> SiteConfigs => Set<SiteConfig>();
    public DbSet<LoyaltyReward> LoyaltyRewards => Set<LoyaltyReward>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        base.OnModelCreating(b);

        b.Entity<User>(e =>
        {
            e.HasIndex(x => x.Email).IsUnique();
            e.HasIndex(x => x.Username).IsUnique();
            e.HasIndex(x => x.ReferralCode);
            e.Property(x => x.WalletBalance).HasColumnType("decimal(18,2)");
            e.HasOne(x => x.Seller).WithOne(s => s!.User!).HasForeignKey<Seller>(s => s.UserId).OnDelete(DeleteBehavior.Cascade);
        });

        b.Entity<Category>(e =>
        {
            e.HasIndex(x => x.Slug).IsUnique();
        });

        b.Entity<Seller>(e =>
        {
            e.HasIndex(x => x.Username).IsUnique();
        });

        b.Entity<Product>(e =>
        {
            e.HasIndex(x => x.Slug).IsUnique();
            e.Property(x => x.Price).HasColumnType("decimal(18,2)");
            e.Property(x => x.ComparePrice).HasColumnType("decimal(18,2)");
            e.HasOne(x => x.Category).WithMany(c => c.Products).HasForeignKey(x => x.CategorySlug).HasPrincipalKey(c => c.Slug);
            e.HasOne(x => x.Seller).WithMany(s => s.Products).HasForeignKey(x => x.SellerId);
        });

        b.Entity<Order>(e =>
        {
            e.HasIndex(x => x.Code).IsUnique();
            e.Property(x => x.Subtotal).HasColumnType("decimal(18,2)");
            e.Property(x => x.Discount).HasColumnType("decimal(18,2)");
            e.Property(x => x.Fee).HasColumnType("decimal(18,2)");
            e.Property(x => x.Total).HasColumnType("decimal(18,2)");
        });

        b.Entity<OrderLine>(e =>
        {
            e.Property(x => x.UnitPrice).HasColumnType("decimal(18,2)");
            e.HasOne(x => x.Order).WithMany(o => o.Lines).HasForeignKey(x => x.OrderId).OnDelete(DeleteBehavior.Cascade);
        });

        b.Entity<CartItem>(e =>
        {
            e.HasIndex(x => new { x.UserId, x.ProductId });
            e.HasOne(x => x.User).WithMany(u => u.CartItems).HasForeignKey(x => x.UserId);
            e.HasOne(x => x.Product).WithMany().HasForeignKey(x => x.ProductId);
        });

        b.Entity<Review>(e =>
        {
            e.HasOne(x => x.Product).WithMany(p => p.Reviews).HasForeignKey(x => x.ProductId);
            e.HasOne(x => x.User).WithMany(u => u.Reviews).HasForeignKey(x => x.UserId);
        });

        b.Entity<WalletTxn>(e =>
        {
            e.Property(x => x.Amount).HasColumnType("decimal(18,2)");
            e.HasOne(x => x.User).WithMany(u => u.WalletTxns).HasForeignKey(x => x.UserId);
        });

        b.Entity<InventoryItem>(e =>
        {
            e.HasOne(x => x.Product).WithMany(p => p.InventoryItems).HasForeignKey(x => x.ProductId);
            e.HasIndex(x => x.ContentHash);
        });

        b.Entity<DisputeMessage>(e =>
        {
            e.HasOne(x => x.Dispute).WithMany().HasForeignKey(x => x.DisputeId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.Author).WithMany().HasForeignKey(x => x.AuthorUserId);
        });

        b.Entity<WithdrawRequest>(e =>
        {
            e.Property(x => x.Amount).HasColumnType("decimal(18,2)");
            e.HasOne(x => x.SellerUser).WithMany().HasForeignKey(x => x.SellerUserId);
        });

        b.Entity<WishlistItem>(e =>
        {
            e.HasIndex(x => new { x.UserId, x.ProductId }).IsUnique();
            e.HasOne(x => x.Product).WithMany().HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.Cascade);
        });

        b.Entity<Notification>(e =>
        {
            e.HasIndex(x => x.UserId);
            e.HasIndex(x => new { x.UserId, x.IsRead });
        });

        b.Entity<Coupon>(e =>
        {
            e.HasIndex(x => x.Code).IsUnique();
            e.Property(x => x.Value).HasColumnType("decimal(18,2)");
            e.Property(x => x.MinOrderAmount).HasColumnType("decimal(18,2)");
            e.Property(x => x.MaxDiscount).HasColumnType("decimal(18,2)");
        });

        b.Entity<CouponUsage>(e =>
        {
            e.HasIndex(x => new { x.CouponId, x.UserId }).IsUnique();
            e.HasOne(x => x.Coupon).WithMany(c => c.Usages).HasForeignKey(x => x.CouponId).OnDelete(DeleteBehavior.Cascade);
        });

        b.Entity<SellerCoupon>(e =>
        {
            e.HasIndex(x => new { x.SellerId, x.Code }).IsUnique();
            e.Property(x => x.Value).HasColumnType("decimal(18,2)");
            e.Property(x => x.MinOrderAmount).HasColumnType("decimal(18,2)");
            e.Property(x => x.MaxDiscount).HasColumnType("decimal(18,2)");
            e.HasOne(x => x.Seller).WithMany().HasForeignKey(x => x.SellerId).OnDelete(DeleteBehavior.Cascade);
        });

        b.Entity<Banner>(e =>
        {
            e.HasIndex(x => x.Position);
        });

        b.Entity<SiteConfig>(e =>
        {
            e.HasKey(x => x.Key);
        });

        b.Entity<LoyaltyReward>(e =>
        {
            e.HasIndex(x => x.Position);
            e.Property(x => x.VoucherAmount).HasColumnType("decimal(18,2)");
        });
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        foreach (var entry in ChangeTracker.Entries<Entity>())
        {
            if (entry.State == EntityState.Modified) entry.Entity.UpdatedAt = DateTime.UtcNow;
        }
        return base.SaveChangesAsync(cancellationToken);
    }
}
