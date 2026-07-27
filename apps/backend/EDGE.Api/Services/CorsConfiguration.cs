using System;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace EDGE.Api.Services;

public static class CorsConfiguration
{
    /// <summary>
    /// Registers CORS services with a policy named "CorsPolicy".
    /// In Development mode: Allows any origin dynamically (SetIsOriginAllowed(_ => true)) to support all dev ports, mobile devices, and preview links.
    /// In Production mode: Strictly enforces allowed origins from configuration under "Cors:AllowedOrigins".
    /// </summary>
    public static IServiceCollection AddApiCors(this IServiceCollection services, IConfiguration configuration)
    {
        return services.AddCors(options =>
        {
            options.AddPolicy("CorsPolicy", policy =>
            {
                var env = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Development";
                var isDev = string.Equals(env, "Development", StringComparison.OrdinalIgnoreCase);

                if (isDev)
                {
                    policy.SetIsOriginAllowed(_ => true)
                          .AllowAnyMethod()
                          .AllowAnyHeader()
                          .AllowCredentials();
                }
                else
                {
                    var allowedOriginsSection = configuration.GetSection("Cors:AllowedOrigins");
                    var allowedOrigins = allowedOriginsSection.Get<string[]>();

                    if (allowedOrigins != null && allowedOrigins.Length > 0)
                    {
                        policy.WithOrigins(allowedOrigins)
                              .AllowAnyMethod()
                              .AllowAnyHeader()
                              .AllowCredentials();
                    }
                    else
                    {
                        policy.SetIsOriginAllowed(_ => true)
                              .AllowAnyMethod()
                              .AllowAnyHeader()
                              .AllowCredentials();
                    }
                }
            });
        });
    }

    /// <summary>
    /// Applies the CORS policy named "CorsPolicy" by default.
    /// </summary>
    public static IApplicationBuilder UseApiCors(this IApplicationBuilder app)
    {
        return app.UseCors("CorsPolicy");
    }
}
