namespace MmoMarket.Application.Auth;

public record RegisterDto(string Email, string Password, string Username, string DisplayName, string? ReferralCode);
public record LoginDto(string Email, string Password);
public record AuthResponse(string AccessToken, UserDto User);
public record UserDto(Guid Id, string Email, string Username, string DisplayName, string Role, decimal WalletBalance, int LoyaltyPoints, string KycStatus, string AvatarColor, string? PhoneNumber);
public record UpdateProfileDto(string DisplayName, string AvatarColor, string? PhoneNumber);
public record ChangePasswordDto(string CurrentPassword, string NewPassword);
public record GoogleLoginDto(string IdToken);
