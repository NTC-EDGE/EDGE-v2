using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace EDGE.Api.Services;

public static class CorsConfiguration
{
    public static bool IsAllowedOrigin(string? origin, string[]? configuredOrigins = null)
    {
        if (string.IsNullOrWhiteSpace(origin)) return false;

        var rawEnv = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
        var env = string.IsNullOrWhiteSpace(rawEnv) ? "Development" : rawEnv.Trim();
        if (string.Equals(env, "Development", StringComparison.OrdinalIgnoreCase))
        {
            return true;
        }

        if (configuredOrigins is { Length: > 0 } &&
            Array.Exists(configuredOrigins, o => string.Equals(o.TrimEnd('/'), origin.TrimEnd('/'), StringComparison.OrdinalIgnoreCase)))
        {
            return true;
        }

        if (Uri.TryCreate(origin, UriKind.Absolute, out var uri))
        {
            var host = uri.Host;
            if (host.Equals("localhost", StringComparison.OrdinalIgnoreCase) ||
                host.Equals("127.0.0.1", StringComparison.OrdinalIgnoreCase) ||
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
    }

    /// <summary>
    /// Registers CORS services with a policy named "CorsPolicy".
    /// In Development mode: Allows any origin dynamically (SetIsOriginAllowed(_ => true)) to support all dev ports, mobile devices, and preview links.
    /// In Production mode: Strictly enforces allowed origins from configuration under "Cors:AllowedOrigins" and trusted domain suffixes.
    /// </summary>
    public static IServiceCollection AddApiCors(this IServiceCollection services, IConfiguration configuration)
    {
        return services.AddCors(options =>
        {
            options.AddPolicy("CorsPolicy", policy =>
            {
                var allowedOriginsSection = configuration.GetSection("Cors:AllowedOrigins");
                var allowedOrigins = allowedOriginsSection.Get<string[]>() ?? Array.Empty<string>();

                policy.SetIsOriginAllowed(origin => IsAllowedOrigin(origin, allowedOrigins))
                      .AllowAnyMethod()
                      .AllowAnyHeader()
                      .AllowCredentials();
            });
        });
    }

    /// <summary>
    /// Applies the CORS policy named "CorsPolicy" and explicitly handles OPTIONS preflight requests
    /// and ensures CORS headers are preserved even when downstream middleware short-circuits or throws.
    /// </summary>
    public static IApplicationBuilder UseApiCors(this IApplicationBuilder app)
    {
        app.Use(async (context, next) =>
        {
            var origin = context.Request.Headers.Origin.ToString();
            var configuration = context.RequestServices.GetService<IConfiguration>();
            var allowedOrigins = configuration?.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? Array.Empty<string>();

            if (!string.IsNullOrWhiteSpace(origin) && IsAllowedOrigin(origin, allowedOrigins))
            {
                context.Response.OnStarting(() =>
                {
                    if (!context.Response.Headers.ContainsKey("Access-Control-Allow-Origin"))
                    {
                        context.Response.Headers["Access-Control-Allow-Origin"] = origin;
                        context.Response.Headers["Access-Control-Allow-Credentials"] = "true";
                        context.Response.Headers["Vary"] = "Origin";
                    }
                    return Task.CompletedTask;
                });

                if (HttpMethods.IsOptions(context.Request.Method))
                {
                    context.Response.Headers["Access-Control-Allow-Origin"] = origin;
                    context.Response.Headers["Access-Control-Allow-Credentials"] = "true";
                    context.Response.Headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS";
                    var requestedHeaders = context.Request.Headers["Access-Control-Request-Headers"].ToString();
                    context.Response.Headers["Access-Control-Allow-Headers"] =
                        string.IsNullOrWhiteSpace(requestedHeaders)
                            ? "Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control, Pragma, Expires"
                            : requestedHeaders;
                    context.Response.Headers["Access-Control-Max-Age"] = "86400";
                    context.Response.Headers["Vary"] = "Origin";
                    context.Response.StatusCode = StatusCodes.Status204NoContent;
                    return;
                }
            }

            await next();
        });

        return app.UseCors("CorsPolicy");
    }
}
