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
    /// Configures Clerk JWT Authentication with support for dev mock tokens.
    /// Throws an <see cref="InvalidOperationException"/> if Clerk:Authority is not configured.
    /// </summary>
    public static IServiceCollection AddClerkAuthentication(this IServiceCollection services, IConfiguration configuration)
    {
        var clerkAuthority = configuration["Clerk:Authority"];

        if (string.IsNullOrWhiteSpace(clerkAuthority))
        {
            throw new InvalidOperationException("Clerk Authority configuration is missing. Please configure 'Clerk:Authority' in your user secrets or environment variables.");
        }

        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.Authority = clerkAuthority;
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = clerkAuthority,
                    ValidateAudience = false,
                    ValidateLifetime = true,
                    NameClaimType = ClaimTypes.NameIdentifier
                };
                options.Events = new JwtBearerEvents
                {
                    OnMessageReceived = context =>
                    {
                        var authHeader = context.Request.Headers["Authorization"].ToString();
                        if (authHeader.StartsWith("Bearer mock_", StringComparison.OrdinalIgnoreCase))
                        {
                            var tokenValue = authHeader.Substring("Bearer ".Length);
                            var roleKey = tokenValue.Substring("mock_".Length); // e.g. "admin", "evaluator", "client"

                            // Map mock token directly to seeded AuthUserIds
                            var authUserId = $"user_{roleKey}123";

                            var claims = new Claim[]
                            {
                                new Claim(ClaimTypes.NameIdentifier, authUserId)
                            };
                            var identity = new ClaimsIdentity(claims, "MockAuth");
                            context.Principal = new ClaimsPrincipal(identity);
                            context.Success();
                        }
                        return Task.CompletedTask;
                    }
                };
            });

        return services;
    }
}
