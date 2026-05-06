using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using MmoMarket.Application.Common;
using MmoMarket.Domain.Entities;
using MmoMarket.Domain.Enums;

namespace MmoMarket.Infrastructure.Persistence;

public static class Seeder
{
    public static async Task SeedAsync(AppDbContext db, IPasswordHasher hasher, CancellationToken ct = default)
    {
        await db.Database.EnsureCreatedAsync(ct);
        await UpgradeSchemaAsync(db, ct);
        if (await db.Categories.AnyAsync(ct)) return;

        // Categories — match frontend slugs
        var categories = new[]
        {
            new Category { Slug = "ai", Name = "AI Account", Short = "AI", IconKey = "sparkles", Description = "ChatGPT, Midjourney, Claude, Perplexity Pro...", Color = "#7c3aed", Position = 1 },
            new Category { Slug = "tool", Name = "Tool / Phần mềm", Short = "Tool", IconKey = "tool", Description = "Photoshop, Office, Canva, Capcut, IDE...", Color = "#22d3ee", Position = 2 },
            new Category { Slug = "course", Name = "Khoá học", Short = "Course", IconKey = "book", Description = "Marketing, dev, design, AI, MMO...", Color = "#fb7185", Position = 3 },
            new Category { Slug = "giftcard", Name = "Gift Card", Short = "GC", IconKey = "gift", Description = "Apple, Google Play, Steam, Amazon...", Color = "#f59e0b", Position = 4 },
            new Category { Slug = "game", Name = "Tài khoản & Skin Game", Short = "Game", IconKey = "gamepad", Description = "LoL, Valorant, Genshin, FO4...", Color = "#10b981", Position = 5 },
            new Category { Slug = "social", Name = "Mạng xã hội", Short = "Social", IconKey = "users", Description = "FB, IG, TikTok, Twitter, YouTube...", Color = "#0ea5e9", Position = 6 },
            new Category { Slug = "engagement", Name = "Tăng tương tác", Short = "Engage", IconKey = "trending", Description = "Like, follow, view, sub, comment...", Color = "#ef4444", Position = 7 },
            new Category { Slug = "bestseller", Name = "Bán chạy", Short = "Hot", IconKey = "fire", Description = "Top sản phẩm sàn", Color = "#a855f7", Position = 8 },
        };
        db.Categories.AddRange(categories);

        // Demo users + sellers
        var adminUser = new User
        {
            Email = "admin@mmo.local",
            PasswordHash = hasher.Hash("Admin@123"),
            Username = "admin",
            DisplayName = "Quản trị viên",
            Role = UserRole.Admin,
            AvatarColor = "#ef4444",
            KycStatus = KycStatus.Approved,
            ReferralCode = "ADMIN001",
        };
        var buyerUser = new User
        {
            Email = "buyer@mmo.local",
            PasswordHash = hasher.Hash("Buyer@123"),
            Username = "buyer",
            DisplayName = "Buyer Demo",
            Role = UserRole.Buyer,
            AvatarColor = "#22d3ee",
            KycStatus = KycStatus.Approved,
            WalletBalance = 5_000_000m,
            LoyaltyPoints = 1280,
            ReferralCode = "BUYER001",
        };
        var sellerUser1 = new User
        {
            Email = "kimchi@mmo.local",
            PasswordHash = hasher.Hash("Seller@123"),
            Username = "kimchi",
            DisplayName = "KimChi Shop",
            Role = UserRole.Seller,
            AvatarColor = "#7c3aed",
            KycStatus = KycStatus.Approved,
            ReferralCode = "KIMCHI01",
        };
        var sellerUser2 = new User
        {
            Email = "vyhan@mmo.local",
            PasswordHash = hasher.Hash("Seller@123"),
            Username = "vyhan",
            DisplayName = "VyHan Studio",
            Role = UserRole.Seller,
            AvatarColor = "#22d3ee",
            KycStatus = KycStatus.Approved,
            ReferralCode = "VYHAN001",
        };
        var sellerUser3 = new User
        {
            Email = "quynhnhu@mmo.local",
            PasswordHash = hasher.Hash("Seller@123"),
            Username = "quynhnhu",
            DisplayName = "QuynhNhu Digital",
            Role = UserRole.Seller,
            AvatarColor = "#fb7185",
            KycStatus = KycStatus.Approved,
            ReferralCode = "QUYNH001",
        };

        db.Users.AddRange(adminUser, buyerUser, sellerUser1, sellerUser2, sellerUser3);

        var s1 = new Seller { UserId = sellerUser1.Id, Username = "kimchi", DisplayName = "KimChi Shop", AvatarColor = "#7c3aed", Rating = 4.9, ReviewCount = 1240, TotalSold = 8420, Badge = "top", Bio = "Shop chuyên AI account & Tool, bảo hành dài hạn.", ResponseTime = "5 phút", JoinedAt = DateTime.UtcNow.AddYears(-2) };
        var s2 = new Seller { UserId = sellerUser2.Id, Username = "vyhan", DisplayName = "VyHan Studio", AvatarColor = "#22d3ee", Rating = 4.85, ReviewCount = 920, TotalSold = 5100, Badge = "verified", Bio = "Tools sáng tạo, gift card chính hãng.", ResponseTime = "10 phút", JoinedAt = DateTime.UtcNow.AddMonths(-18) };
        var s3 = new Seller { UserId = sellerUser3.Id, Username = "quynhnhu", DisplayName = "QuynhNhu Digital", AvatarColor = "#fb7185", Rating = 4.78, ReviewCount = 612, TotalSold = 3210, Badge = "verified", Bio = "Khoá học chất lượng, hỗ trợ tận tình.", ResponseTime = "20 phút", JoinedAt = DateTime.UtcNow.AddMonths(-9) };
        db.Sellers.AddRange(s1, s2, s3);

        // Products — 3 per category for demo
        var sellers = new[] { s1, s2, s3 };
        int idx = 0;
        var random = new Random(42);
        foreach (var cat in categories.Where(c => c.Slug != "bestseller"))
        {
            for (int i = 1; i <= 4; i++)
            {
                var seller = sellers[idx % sellers.Length];
                var price = (decimal)random.Next(50, 1500) * 1000m;
                var sold = random.Next(10, 800);
                var stock = random.Next(5, 200);
                var rating = 4.2 + random.NextDouble() * 0.8;
                var product = new Product
                {
                    Slug = $"{cat.Slug}-{i:00}",
                    Title = $"{cat.Name} #{i:00}",
                    CategorySlug = cat.Slug,
                    SellerId = seller.Id,
                    Price = price,
                    ComparePrice = price * 1.3m,
                    Delivery = i % 2 == 0 ? DeliveryMethod.Auto : DeliveryMethod.Manual,
                    WarrantyDays = i % 3 == 0 ? 30 : 7,
                    Stock = stock,
                    Sold = sold,
                    Rating = Math.Round(rating, 2),
                    ReviewCount = random.Next(20, 250),
                    ThumbnailColor = cat.Color,
                    ThumbnailIcon = cat.IconKey,
                    Description = $"Sản phẩm chất lượng cao thuộc danh mục {cat.Name}. Cam kết bảo hành đầy đủ.\n\nHàng có sẵn, giao trong 5 giây.",
                    FeaturesJson = JsonSerializer.Serialize(new[] { "Bảo hành 1-1", "Hỗ trợ 24/7", "Hoàn tiền trong 72h" }),
                    PoliciesJson = JsonSerializer.Serialize(new[] { "Không chia sẻ ngoài người mua", "Không vi phạm chính sách nền tảng" }),
                    FaqJson = JsonSerializer.Serialize(new[] {
                        new { Q = "Bao lâu nhận được hàng?", A = "Đơn auto giao trong < 5 giây sau khi thanh toán." },
                        new { Q = "Bảo hành thế nào?", A = "Bảo hành 1-1 trong 7 ngày kể từ khi nhận hàng." }
                    }),
                    BadgesJson = JsonSerializer.Serialize(i == 1 ? new[] { "Hot", "Bảo hành 1-1" } : new[] { "Bảo hành 1-1" }),
                };
                db.Products.Add(product);
                idx++;
            }
        }

        await db.SaveChangesAsync(ct);
    }

    /// <summary>
    /// Idempotently apply schema changes for entities added after initial DB creation.
    /// Uses raw SQL with IF NOT EXISTS so it is safe to run on every startup.
    /// </summary>
    private static async Task UpgradeSchemaAsync(AppDbContext db, CancellationToken ct)
    {
        await db.Database.ExecuteSqlRawAsync(@"
            CREATE TABLE IF NOT EXISTS DisputeMessages (
                Id TEXT NOT NULL CONSTRAINT PK_DisputeMessages PRIMARY KEY,
                DisputeId TEXT NOT NULL,
                AuthorUserId TEXT NOT NULL,
                AuthorRole TEXT NOT NULL,
                Body TEXT NOT NULL,
                CreatedAt TEXT NOT NULL,
                UpdatedAt TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS IX_DisputeMessages_DisputeId ON DisputeMessages(DisputeId);

            CREATE TABLE IF NOT EXISTS WithdrawRequests (
                Id TEXT NOT NULL CONSTRAINT PK_WithdrawRequests PRIMARY KEY,
                SellerUserId TEXT NOT NULL,
                Amount TEXT NOT NULL,
                Method TEXT NOT NULL,
                Account TEXT NOT NULL,
                Status INTEGER NOT NULL,
                Note TEXT NULL,
                AdminNote TEXT NULL,
                ProcessedAt TEXT NULL,
                CreatedAt TEXT NOT NULL,
                UpdatedAt TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS IX_WithdrawRequests_SellerUserId ON WithdrawRequests(SellerUserId);
        ", ct);
    }
}
