using MmoMarket.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace MmoMarket.Application.Common;

public interface IAppDbContext
{
    DbSet<User> Users { get; }
    DbSet<Seller> Sellers { get; }
    DbSet<Category> Categories { get; }
    DbSet<Product> Products { get; }
    DbSet<InventoryItem> InventoryItems { get; }
    DbSet<Order> Orders { get; }
    DbSet<OrderLine> OrderLines { get; }
    DbSet<CartItem> CartItems { get; }
    DbSet<Review> Reviews { get; }
    DbSet<WalletTxn> WalletTxns { get; }
    DbSet<Dispute> Disputes { get; }
    DbSet<DisputeMessage> DisputeMessages { get; }
    DbSet<KycSubmission> KycSubmissions { get; }
    DbSet<WithdrawRequest> WithdrawRequests { get; }
    Task<int> SaveChangesAsync(CancellationToken ct = default);
}

public interface IPasswordHasher
{
    string Hash(string password);
    bool Verify(string password, string hash);
}

public interface IJwtTokenService
{
    string GenerateAccessToken(User user);
}

public interface ICurrentUser
{
    Guid? UserId { get; }
    string? Username { get; }
    string? Role { get; }
    bool IsAuthenticated { get; }
}
