using System.Security.Cryptography;
using System.Text;

namespace MmoMarket.Application.Auth;

public class TotpService
{
    private const int Period = 30;
    private const int Digits = 6;
    private const string SiteName = "MMO Market";

    public TwoFaSetupResult GenerateSetup(string email)
    {
        var key = new byte[20];
        RandomNumberGenerator.Fill(key);
        var secret = Base32Encode(key);
        var label = Uri.EscapeDataString($"{SiteName}:{email}");
        var issuer = Uri.EscapeDataString(SiteName);
        var otpUri = $"otpauth://totp/{label}?secret={secret}&issuer={issuer}&algorithm=SHA1&digits=6&period=30";
        var qrUrl = $"https://api.qrserver.com/v1/create-qr-code/?size=200x200&data={Uri.EscapeDataString(otpUri)}";
        return new TwoFaSetupResult(qrUrl, secret);
    }

    public bool Verify(string secret, string code)
    {
        if (string.IsNullOrWhiteSpace(secret) || string.IsNullOrWhiteSpace(code)) return false;
        byte[] key;
        try { key = Base32Decode(secret); } catch { return false; }
        var now = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        for (var window = -1; window <= 1; window++)
        {
            if (ComputeTotp(key, now / Period + window) == code.Trim())
                return true;
        }
        return false;
    }

    private static string ComputeTotp(byte[] key, long counter)
    {
        var counterBytes = BitConverter.GetBytes(counter);
        if (BitConverter.IsLittleEndian) Array.Reverse(counterBytes);
        using var hmac = new HMACSHA1(key);
        var hash = hmac.ComputeHash(counterBytes);
        var offset = hash[^1] & 0x0F;
        var code = ((hash[offset] & 0x7F) << 24)
                 | ((hash[offset + 1] & 0xFF) << 16)
                 | ((hash[offset + 2] & 0xFF) << 8)
                 | (hash[offset + 3] & 0xFF);
        return (code % 1_000_000).ToString("D6");
    }

    private static string Base32Encode(byte[] data)
    {
        const string Alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
        var sb = new StringBuilder();
        int bits = 0, value = 0;
        foreach (var b in data)
        {
            value = (value << 8) | b;
            bits += 8;
            while (bits >= 5) { sb.Append(Alphabet[(value >> (bits - 5)) & 31]); bits -= 5; }
        }
        if (bits > 0) sb.Append(Alphabet[(value << (5 - bits)) & 31]);
        return sb.ToString();
    }

    private static byte[] Base32Decode(string s)
    {
        const string Alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
        var clean = s.TrimEnd('=').ToUpperInvariant();
        var result = new List<byte>();
        int bits = 0, value = 0;
        foreach (var c in clean)
        {
            var idx = Alphabet.IndexOf(c);
            if (idx < 0) continue;
            value = (value << 5) | idx;
            bits += 5;
            if (bits >= 8) { result.Add((byte)((value >> (bits - 8)) & 0xFF)); bits -= 8; }
        }
        return result.ToArray();
    }
}
