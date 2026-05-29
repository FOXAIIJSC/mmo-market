using Microsoft.EntityFrameworkCore;
using MmoMarket.Application.Common;
using MmoMarket.Application.Config;
using MmoMarket.Domain.Entities;
using MmoMarket.Domain.Enums;

namespace MmoMarket.Application.Auth;

public class AuthService
{
    private readonly IAppDbContext _db;
    private readonly IPasswordHasher _hasher;
    private readonly IJwtTokenService _jwt;
    private readonly ConfigService _config;

    public AuthService(IAppDbContext db, IPasswordHasher hasher, IJwtTokenService jwt, ConfigService config)
    {
        _db = db;
        _hasher = hasher;
        _jwt = jwt;
        _config = config;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterDto dto, CancellationToken ct)
    {
        var email = dto.Email.Trim().ToLowerInvariant();
        if (await _db.Users.AnyAsync(u => u.Email == email, ct))
            throw new AppException("Email đã tồn tại");
        if (await _db.Users.AnyAsync(u => u.Username == dto.Username, ct))
            throw new AppException("Username đã tồn tại");

        var signupBonus  = await _config.GetIntAsync(ConfigKeys.LoyaltySignupBonus, 100, ct);
        var welcomeBonus = await _config.GetDecimalAsync(ConfigKeys.WelcomeBonus, 100_000m, ct);
        var user = new User
        {
            Email = email,
            PasswordHash = _hasher.Hash(dto.Password),
            Username = dto.Username,
            DisplayName = dto.DisplayName,
            Role = UserRole.Buyer,
            ReferralCode = Guid.NewGuid().ToString("N")[..8].ToUpperInvariant(),
            WalletBalance = welcomeBonus,
            LoyaltyPoints = signupBonus,
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

    public async Task<UserDto> UpdateProfileAsync(Guid userId, UpdateProfileDto dto, CancellationToken ct)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId, ct)
            ?? throw new AppException("User không tồn tại", 404);
        if (string.IsNullOrWhiteSpace(dto.DisplayName))
            throw new AppException("Tên hiển thị không được để trống");
        user.DisplayName = dto.DisplayName.Trim();
        user.AvatarColor = dto.AvatarColor;
        user.PhoneNumber = string.IsNullOrWhiteSpace(dto.PhoneNumber) ? null : dto.PhoneNumber.Trim();
        await _db.SaveChangesAsync(ct);
        return Map(user);
    }

    public async Task ChangePasswordAsync(Guid userId, ChangePasswordDto dto, CancellationToken ct)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId, ct)
            ?? throw new AppException("User không tồn tại", 404);
        if (!_hasher.Verify(dto.CurrentPassword, user.PasswordHash))
            throw new AppException("Mật khẩu hiện tại không đúng");
        if (dto.NewPassword.Length < 6)
            throw new AppException("Mật khẩu mới phải có ít nhất 6 ký tự");
        user.PasswordHash = _hasher.Hash(dto.NewPassword);
        await _db.SaveChangesAsync(ct);
    }

    public static UserDto Map(User u) => new(
        u.Id, u.Email, u.Username, u.DisplayName, u.Role.ToString(),
        u.WalletBalance, u.LoyaltyPoints, u.KycStatus.ToString(), u.AvatarColor, u.PhoneNumber);
}
