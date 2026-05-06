using Microsoft.EntityFrameworkCore;
using MmoMarket.Application.Common;
using MmoMarket.Domain.Entities;
using MmoMarket.Domain.Enums;

namespace MmoMarket.Application.Auth;

public class AuthService
{
    private readonly IAppDbContext _db;
    private readonly IPasswordHasher _hasher;
    private readonly IJwtTokenService _jwt;

    public AuthService(IAppDbContext db, IPasswordHasher hasher, IJwtTokenService jwt)
    {
        _db = db;
        _hasher = hasher;
        _jwt = jwt;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterDto dto, CancellationToken ct)
    {
        var email = dto.Email.Trim().ToLowerInvariant();
        if (await _db.Users.AnyAsync(u => u.Email == email, ct))
            throw new AppException("Email đã tồn tại");
        if (await _db.Users.AnyAsync(u => u.Username == dto.Username, ct))
            throw new AppException("Username đã tồn tại");

        var user = new User
        {
            Email = email,
            PasswordHash = _hasher.Hash(dto.Password),
            Username = dto.Username,
            DisplayName = dto.DisplayName,
            Role = UserRole.Buyer,
            ReferralCode = Guid.NewGuid().ToString("N")[..8].ToUpperInvariant(),
            WalletBalance = 100_000m, // welcome bonus
            LoyaltyPoints = 100,
        };

        if (!string.IsNullOrWhiteSpace(dto.ReferralCode))
        {
            var refUser = await _db.Users.FirstOrDefaultAsync(u => u.ReferralCode == dto.ReferralCode, ct);
            if (refUser != null)
            {
                user.ReferredByUserId = refUser.Id;
            }
        }

        _db.Users.Add(user);
        _db.WalletTxns.Add(new WalletTxn
        {
            UserId = user.Id,
            Type = WalletTxnType.Bonus,
            Amount = 100_000m,
            Status = WalletTxnStatus.Completed,
            Note = "Quà chào mừng",
        });
        await _db.SaveChangesAsync(ct);

        return new AuthResponse(_jwt.GenerateAccessToken(user), Map(user));
    }

    public async Task<AuthResponse> LoginAsync(LoginDto dto, CancellationToken ct)
    {
        var email = dto.Email.Trim().ToLowerInvariant();
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email, ct)
            ?? throw new AppException("Sai email hoặc mật khẩu", 401);
        if (!_hasher.Verify(dto.Password, user.PasswordHash))
            throw new AppException("Sai email hoặc mật khẩu", 401);
        return new AuthResponse(_jwt.GenerateAccessToken(user), Map(user));
    }

    public async Task<UserDto> MeAsync(Guid userId, CancellationToken ct)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId, ct)
            ?? throw new AppException("User không tồn tại", 404);
        return Map(user);
    }

    public static UserDto Map(User u) => new(
        u.Id, u.Email, u.Username, u.DisplayName, u.Role.ToString(),
        u.WalletBalance, u.LoyaltyPoints, u.KycStatus.ToString(), u.AvatarColor);
}
