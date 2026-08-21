using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;

namespace EDGE.Api.Services;

public static class ClerkAuthenticationExtensions
{
    /// <summary>
    /// Configures Clerk JWT Authentication.
    /// Throws an <see cref="InvalidOperationException"/> if Clerk:Authority is not configured.
    /// </summary>
    public static IServiceCollection AddClerkAuthentication(this IServiceCollection services, IConfiguration configuration)
    {
        var clerkAuthority = configuration["Clerk:Authority"];

        if (string.IsNullOrWhiteSpace(clerkAuthority))
        {
            throw new InvalidOperationException("Clerk Authority configuration is missing. Please configure 'Clerk:Authority' in your user secrets or environment variables.");
        }

        var validIssuers = new System.Collections.Generic.List<string>();
        if (!string.IsNullOrWhiteSpace(clerkAuthority))
        {
            validIssuers.Add(clerkAuthority.TrimEnd('/'));
            validIssuers.Add(clerkAuthority.TrimEnd('/') + "/");
        }
        validIssuers.Add("https://wired-boar-76.clerk.accounts.dev");
        validIssuers.Add("https://wired-boar-76.clerk.accounts.dev/");
        validIssuers.Add("https://easy-snipe-36.clerk.accounts.dev");
        validIssuers.Add("https://easy-snipe-36.clerk.accounts.dev/");

        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.Authority = clerkAuthority;
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuers = validIssuers.Distinct(StringComparer.OrdinalIgnoreCase).ToArray(),
                    ValidateAudience = false,
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.FromMinutes(2),
                    NameClaimType = ClaimTypes.NameIdentifier
                };

                options.Events = new JwtBearerEvents
                {
                    OnAuthenticationFailed = context =>
                    {
                        Serilog.Log.Warning("Clerk JWT Authentication failed: {Message} | Exception: {Exception}", context.Exception.Message, context.Exception.GetType().Name);
                        return Task.CompletedTask;
                    }
                };
            });

        return services;
    }
}
