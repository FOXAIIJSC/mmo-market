using Microsoft.EntityFrameworkCore;
using MmoMarket.Application.Common;
using MmoMarket.Domain.Entities;

namespace MmoMarket.Application.Config;

public static class ConfigKeys
{
    // Fee & Loyalty
    public const string FeeRate              = "fee_rate";
    public const string LoyaltyPtsPer1000    = "loyalty_pts_per_1000";
    public const string LoyaltySignupBonus   = "loyalty_signup_bonus";
    public const string LoyaltyReviewBonus   = "loyalty_review_bonus";
    public const string LoyaltyReferralBonus = "loyalty_referral_bonus";
    public const string LoyaltyTierSilver    = "loyalty_tier_silver";
    public const string LoyaltyTierGold      = "loyalty_tier_gold";
    public const string LoyaltyTierDiamond   = "loyalty_tier_diamond";

    // Site info
    public const string SiteName        = "site_name";
    public const string SiteDescription = "site_description";
    public const string ContactEmail    = "contact_email";
    public const string ContactPhone    = "contact_phone";

    // Operations
    public const string MaintenanceMode    = "maintenance_mode";
    public const string MaintenanceMessage = "maintenance_message";
    public const string RegistrationEnabled = "registration_enabled";
    public const string WelcomeBonus       = "welcome_bonus";

    // Transaction rules
    public const string MinWithdraw        = "min_withdraw";
    public const string MaxWithdraw        = "max_withdraw";
    public const string EscrowReleaseDays  = "escrow_release_days";
    public const string DisputeSlaHours    = "dispute_sla_hours";
    public const string KycRequiredToSell  = "kyc_required_to_sell";

    // Payment
    public const string EnabledPayments = "enabled_payments";
}

public class ConfigService
{
    private readonly IAppDbContext _db;
    public ConfigService(IAppDbContext db) => _db = db;

    public async Task<string?> GetAsync(string key, CancellationToken ct = default)
    {
        var c = await _db.SiteConfigs.FirstOrDefaultAsync(x => x.Key == key, ct);
        return c?.Value;
    }

    public async Task<decimal> GetDecimalAsync(string key, decimal defaultVal, CancellationToken ct = default)
    {
        var v = await GetAsync(key, ct);
        return v != null && decimal.TryParse(v, System.Globalization.NumberStyles.Any,
            System.Globalization.CultureInfo.InvariantCulture, out var d) ? d : defaultVal;
    }

    public async Task<int> GetIntAsync(string key, int defaultVal, CancellationToken ct = default)
    {
        var v = await GetAsync(key, ct);
        return v != null && int.TryParse(v, out var i) ? i : defaultVal;
    }

    public async Task SetAsync(string key, string value, CancellationToken ct = default)
    {
        var c = await _db.SiteConfigs.FirstOrDefaultAsync(x => x.Key == key, ct);
        if (c == null)
        {
            c = new SiteConfig { Key = key, Value = value, UpdatedAt = DateTime.UtcNow };
            _db.SiteConfigs.Add(c);
        }
        else
        {
            c.Value = value;
            c.UpdatedAt = DateTime.UtcNow;
        }
        await _db.SaveChangesAsync(ct);
    }

    public async Task<bool> GetBoolAsync(string key, bool defaultVal, CancellationToken ct = default)
    {
        var v = await GetAsync(key, ct);
        return v == null ? defaultVal : v == "true";
    }

    public async Task SetBatchAsync(Dictionary<string, string> pairs, CancellationToken ct = default)
    {
        var keys = pairs.Keys.ToList();
        var existing = await _db.SiteConfigs.Where(c => keys.Contains(c.Key)).ToListAsync(ct);
        var map = existing.ToDictionary(c => c.Key);
        foreach (var (k, v) in pairs)
        {
            if (map.TryGetValue(k, out var cfg))
            {
                cfg.Value = v;
                cfg.UpdatedAt = DateTime.UtcNow;
            }
            else
            {
                _db.SiteConfigs.Add(new SiteConfig { Key = k, Value = v, UpdatedAt = DateTime.UtcNow });
            }
        }
        await _db.SaveChangesAsync(ct);
    }

    public async Task<Dictionary<string, string>> GetAllAsync(CancellationToken ct = default)
    {
        var all = await _db.SiteConfigs.ToListAsync(ct);
        return all.ToDictionary(c => c.Key, c => c.Value);
    }
}
