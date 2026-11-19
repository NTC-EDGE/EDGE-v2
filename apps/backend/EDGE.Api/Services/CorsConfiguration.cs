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
                var rawEnv = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
                var env = string.IsNullOrWhiteSpace(rawEnv) ? "Development" : rawEnv.Trim();
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
                    var allowedOrigins = allowedOriginsSection.Get<string[]>() ?? Array.Empty<string>();

                    policy.SetIsOriginAllowed(origin =>
                          {
                              if (string.IsNullOrWhiteSpace(origin)) return false;
                              if (Array.Exists(allowedOrigins, o => string.Equals(o.TrimEnd('/'), origin.TrimEnd('/'), StringComparison.OrdinalIgnoreCase)))
                              {
                                  return true;
                              }
                              if (Uri.TryCreate(origin, UriKind.Absolute, out var uri))
                              {
                                  var host = uri.Host;
                                  if (host.Equals("localhost", StringComparison.OrdinalIgnoreCase) ||
                                      host.Equals("ntc.gov.ph", StringComparison.OrdinalIgnoreCase) ||
                                      host.Equals("ntc-edge.gov.ph", StringComparison.OrdinalIgnoreCase) ||
                                      host.EndsWith(".vercel.app", StringComparison.OrdinalIgnoreCase) ||
                                      host.EndsWith(".nextstep-software.com", StringComparison.OrdinalIgnoreCase) ||
                                      host.EndsWith(".ntc.gov.ph", StringComparison.OrdinalIgnoreCase) ||
                                      host.EndsWith(".ntc-edge.gov.ph", StringComparison.OrdinalIgnoreCase))
                                  {
                                      return true;
                                  }
                              }
                              return false;
                          })
                          .AllowAnyMethod()
                          .AllowAnyHeader()
                          .AllowCredentials();
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
