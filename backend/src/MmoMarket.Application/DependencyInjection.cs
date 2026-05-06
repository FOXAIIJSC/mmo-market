using Microsoft.Extensions.DependencyInjection;
using MmoMarket.Application.Admin;
using MmoMarket.Application.Auth;
using MmoMarket.Application.Cart;
using MmoMarket.Application.Catalog;
using MmoMarket.Application.Orders;
using MmoMarket.Application.Sellers;
using MmoMarket.Application.Wallet;

namespace MmoMarket.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<AuthService>();
        services.AddScoped<CatalogService>();
        services.AddScoped<CartService>();
        services.AddScoped<OrderService>();
        services.AddScoped<WalletService>();
        services.AddScoped<KycService>();
        services.AddScoped<AdminService>();
        return services;
    }
}
