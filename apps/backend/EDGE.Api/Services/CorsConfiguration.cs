using System;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace EDGE.Api.Services;

public static class CorsConfiguration
{
    /// <summary>
    /// Registers CORS services with a policy named "CorsPolicy" using allowed origins from configuration.
    /// The allowed origins should be specified in the configuration under "Cors:AllowedOrigins" as a JSON array of strings.
    /// Throws an <see cref="InvalidOperationException"/> if CORS allowed origins are not configured as a non-empty array.
    /// </summary>
    public static IServiceCollection AddApiCors(this IServiceCollection services, IConfiguration configuration)
    {
        var allowedOriginsSection = configuration.GetSection("Cors:AllowedOrigins");

        if (!allowedOriginsSection.Exists())
        {
            throw new InvalidOperationException(
                "CORS AllowedOrigins configuration is missing. Please configure 'Cors:AllowedOrigins' as a JSON array in your appsettings.json.");
        }

        // Bind strictly as a string array
        var allowedOrigins = allowedOriginsSection.Get<string[]>();
        if (allowedOrigins == null || allowedOrigins.Length == 0)
        {
            throw new InvalidOperationException(
                "CORS AllowedOrigins must be configured as a non-empty JSON array under 'Cors:AllowedOrigins'.");
        }

        return services.AddCors(options =>
        {
            
            options.AddPolicy("CorsPolicy", policy =>
            {
                policy.WithOrigins(allowedOrigins)
                      .AllowAnyMethod()
                      .AllowAnyHeader()
                      .AllowCredentials();
            });
        });
    }

    /// <summary>
    /// Applies the CORS policy named "CorsPolicy" by default.
    /// </summary>
    public static IApplicationBuilder UseApiCors(this IApplicationBuilder app)
    {
        var env = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Development";
        
        return app.UseCors("CorsPolicy");
    }
}
