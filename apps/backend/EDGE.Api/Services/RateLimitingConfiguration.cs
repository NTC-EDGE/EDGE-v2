using System;
using System.Globalization;
using System.Linq;
using System.Net;
using System.Security.Claims;
using System.Text.Json;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using EDGE.Application.Common.Models;

namespace EDGE.Api.Services;

public static class RateLimitPolicies
{
    public const string StrictMutation = "strict-mutation";
    public const string FileUpload = "file-upload";
    public const string HeavyCompute = "heavy-compute";
    public const string Webhook = "webhook";
}

public static class RateLimitingConfiguration
{
    private const long DefaultMaxRequestBodySizeBytes = 25 * 1024 * 1024; // 25 MB

    /// <summary>
    /// Configures ForwardedHeaders, Kestrel/Multipart payload size limits, and native ASP.NET Core Rate Limiting
    /// to protect the API against DDoS, credential stuffing, and resource exhaustion attacks.
    /// </summary>
    public static WebApplicationBuilder AddApiRequestProtection(this WebApplicationBuilder builder)
    {
        var configuration = builder.Configuration;
        var services = builder.Services;

        // 1. Configure Reverse-Proxy Forwarded Headers (Cloudflare, NGINX, AWS ALB, etc.)
        services.Configure<ForwardedHeadersOptions>(options =>
        {
            options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
            options.ForwardLimit = 2;
            // Clear default loopback-only restrictions so container/cloud proxies forward real client IPs
            options.KnownIPNetworks.Clear();
            options.KnownProxies.Clear();
        });

        // 2. Configure Kestrel & Multipart Form Request Limits (Anti-Slowloris & Payload Exhaustion)
        var maxBodyBytes = configuration.GetValue<long?>("RateLimiting:MaxRequestBodySizeBytes")
            ?? DefaultMaxRequestBodySizeBytes;

        builder.WebHost.ConfigureKestrel(serverOptions =>
        {
            serverOptions.AddServerHeader = false;
            serverOptions.Limits.MaxRequestBodySize = maxBodyBytes;
            serverOptions.Limits.RequestHeadersTimeout = TimeSpan.FromSeconds(30);
            serverOptions.Limits.KeepAliveTimeout = TimeSpan.FromMinutes(2);
            serverOptions.Limits.MaxRequestHeadersTotalSize = 32 * 1024; // 32 KB
            serverOptions.Limits.MaxRequestHeaderCount = 100;
        });

        services.Configure<FormOptions>(formOptions =>
        {
            formOptions.MultipartBodyLengthLimit = maxBodyBytes;
            formOptions.ValueLengthLimit = 4 * 1024 * 1024; // 4 MB
            formOptions.MemoryBufferThreshold = 1024 * 1024; // 1 MB before buffering to disk
        });

        // 3. Configure Partitioned Global & Endpoint-Specific Rate Limiters
        var enabled = configuration.GetValue("RateLimiting:Enabled", true);
        var authenticatedPermitLimit = configuration.GetValue("RateLimiting:AuthenticatedPermitLimitPerMinute", 240);
        var anonymousPermitLimit = configuration.GetValue("RateLimiting:AnonymousPermitLimitPerMinute", 90);
        var realtimePermitLimit = configuration.GetValue("RateLimiting:RealtimePermitLimitPerMinute", 5000);
        var strictMutationPermitLimit = configuration.GetValue("RateLimiting:StrictMutationPermitLimitPerMinute", 30);
        var fileUploadPermitLimit = configuration.GetValue("RateLimiting:FileUploadPermitLimitPerMinute", 20);
        var heavyComputePermitLimit = configuration.GetValue("RateLimiting:HeavyComputePermitLimitPerMinute", 30);
        var webhookPermitLimit = configuration.GetValue("RateLimiting:WebhookPermitLimitPerMinute", 120);

        services.AddRateLimiter(options =>
        {
            options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

            options.OnRejected = async (context, cancellationToken) =>
            {
                var httpContext = context.HttpContext;
                var logger = httpContext.RequestServices
                    .GetService<ILoggerFactory>()?
                    .CreateLogger("EDGE.Api.RateLimiting");

                var partitionKey = ResolvePartitionKey(httpContext);
                var retryAfterSeconds = 60;

                if (context.Lease.TryGetMetadata(MetadataName.RetryAfter, out var retryAfter))
                {
                    retryAfterSeconds = Math.Max(1, (int)Math.Ceiling(retryAfter.TotalSeconds));
                }

                httpContext.Response.StatusCode = StatusCodes.Status429TooManyRequests;
                httpContext.Response.Headers.RetryAfter = retryAfterSeconds.ToString(CultureInfo.InvariantCulture);
                httpContext.Response.ContentType = "application/json";

                logger?.LogWarning(
                    "Rate limit exceeded for partition '{PartitionKey}' on {Method} {Path}. Retry-After: {RetryAfterSeconds}s.",
                    partitionKey,
                    httpContext.Request.Method,
                    httpContext.Request.Path,
                    retryAfterSeconds);

                var response = new ApiResponse<object>
                {
                    Succeeded = false,
                    Message = $"Too many requests. Please wait {retryAfterSeconds} seconds before retrying.",
                    Errors = new System.Collections.Generic.Dictionary<string, string[]>
                    {
                        { "RateLimit", new[] { $"Request rate limit exceeded. Retry after {retryAfterSeconds} seconds." } }
                    }
                };

                var jsonOptions = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
                await httpContext.Response.WriteAsync(JsonSerializer.Serialize(response, jsonOptions), cancellationToken);
            };

            // Global Partitioned Sliding Window Limiter (Per Authenticated User or Client IP)
            options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(httpContext =>
            {
                if (!enabled || HttpMethods.IsOptions(httpContext.Request.Method))
                {
                    return RateLimitPartition.GetNoLimiter("unlimited");
                }

                var isRealtimeHub = httpContext.Request.Path.StartsWithSegments("/hubs");
                var isAuthenticated = httpContext.User.Identity?.IsAuthenticated == true;
                var partitionKey = ResolvePartitionKey(httpContext);

                if (isRealtimeHub)
                {
                    return RateLimitPartition.GetSlidingWindowLimiter(
                        partitionKey: isAuthenticated ? $"realtime:user:{partitionKey}" : $"realtime:ip:{partitionKey}",
                        factory: _ => new SlidingWindowRateLimiterOptions
                        {
                            PermitLimit = realtimePermitLimit,
                            Window = TimeSpan.FromMinutes(1),
                            SegmentsPerWindow = 6,
                            QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                            QueueLimit = 20,
                            AutoReplenishment = true
                        });
                }

                return RateLimitPartition.GetSlidingWindowLimiter(
                    partitionKey: isAuthenticated ? $"global:user:{partitionKey}" : $"global:ip:{partitionKey}",
                    factory: _ => new SlidingWindowRateLimiterOptions
                    {
                        PermitLimit = isAuthenticated ? authenticatedPermitLimit : anonymousPermitLimit,
                        Window = TimeSpan.FromMinutes(1),
                        SegmentsPerWindow = 6,
                        QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                        QueueLimit = 2,
                        AutoReplenishment = true
                    });
            });

            // Strict Mutation Policy (Submissions, Payments, Official Receipt Issuance)
            options.AddPolicy(RateLimitPolicies.StrictMutation, httpContext =>
            {
                if (!enabled)
                {
                    return RateLimitPartition.GetNoLimiter("unlimited");
                }

                var partitionKey = ResolvePartitionKey(httpContext);
                return RateLimitPartition.GetTokenBucketLimiter(
                    partitionKey: $"mutation:{partitionKey}",
                    factory: _ => new TokenBucketRateLimiterOptions
                    {
                        TokenLimit = strictMutationPermitLimit,
                        TokensPerPeriod = strictMutationPermitLimit,
                        ReplenishmentPeriod = TimeSpan.FromMinutes(1),
                        QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                        QueueLimit = 2,
                        AutoReplenishment = true
                    });
            });

            // File Upload Policy (Cloudflare R2 Storage, CSV Imports, Requirement Uploads)
            options.AddPolicy(RateLimitPolicies.FileUpload, httpContext =>
            {
                if (!enabled)
                {
                    return RateLimitPartition.GetNoLimiter("unlimited");
                }

                var partitionKey = ResolvePartitionKey(httpContext);
                return RateLimitPartition.GetFixedWindowLimiter(
                    partitionKey: $"upload:{partitionKey}",
                    factory: _ => new FixedWindowRateLimiterOptions
                    {
                        PermitLimit = fileUploadPermitLimit,
                        Window = TimeSpan.FromMinutes(1),
                        QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                        QueueLimit = 1,
                        AutoReplenishment = true
                    });
            });

            // Heavy Compute Policy (PDF Rendering & Accountable Form Printing)
            options.AddPolicy(RateLimitPolicies.HeavyCompute, httpContext =>
            {
                if (!enabled)
                {
                    return RateLimitPartition.GetNoLimiter("unlimited");
                }

                var partitionKey = ResolvePartitionKey(httpContext);
                return RateLimitPartition.GetSlidingWindowLimiter(
                    partitionKey: $"compute:{partitionKey}",
                    factory: _ => new SlidingWindowRateLimiterOptions
                    {
                        PermitLimit = heavyComputePermitLimit,
                        Window = TimeSpan.FromMinutes(1),
                        SegmentsPerWindow = 4,
                        QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                        QueueLimit = 2,
                        AutoReplenishment = true
                    });
            });

            // Webhook Policy (Clerk Identity Webhooks)
            options.AddPolicy(RateLimitPolicies.Webhook, httpContext =>
            {
                if (!enabled)
                {
                    return RateLimitPartition.GetNoLimiter("unlimited");
                }

                var clientIp = ResolveClientIp(httpContext);
                return RateLimitPartition.GetFixedWindowLimiter(
                    partitionKey: $"webhook:{clientIp}",
                    factory: _ => new FixedWindowRateLimiterOptions
                    {
                        PermitLimit = webhookPermitLimit,
                        Window = TimeSpan.FromMinutes(1),
                        QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                        QueueLimit = 4,
                        AutoReplenishment = true
                    });
            });
        });

        return builder;
    }

    /// <summary>
    /// Resolves a unique partition key using the authenticated user's subject claim when available,
    /// falling back to the client IP address.
    /// </summary>
    private static string ResolvePartitionKey(HttpContext httpContext)
    {
        if (httpContext.User.Identity?.IsAuthenticated == true)
        {
            var userId = httpContext.User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? httpContext.User.FindFirstValue("sub")
                ?? httpContext.User.Identity.Name;

            if (!string.IsNullOrWhiteSpace(userId))
            {
                return userId;
            }
        }

        return ResolveClientIp(httpContext);
    }

    /// <summary>
    /// Extracts the originating client IP address from Cloudflare/Proxy headers or the socket connection.
    /// </summary>
    private static string ResolveClientIp(HttpContext httpContext)
    {
        var cfIp = httpContext.Request.Headers["CF-Connecting-IP"].FirstOrDefault();
        if (!string.IsNullOrWhiteSpace(cfIp) && IPAddress.TryParse(cfIp.Trim(), out var parsedCfIp))
        {
            return parsedCfIp.ToString();
        }

        var forwardedFor = httpContext.Request.Headers["X-Forwarded-For"].FirstOrDefault();
        if (!string.IsNullOrWhiteSpace(forwardedFor))
        {
            var firstIp = forwardedFor.Split(',', StringSplitOptions.RemoveEmptyEntries).FirstOrDefault()?.Trim();
            if (!string.IsNullOrWhiteSpace(firstIp) && IPAddress.TryParse(firstIp, out var parsedForwardedIp))
            {
                return parsedForwardedIp.ToString();
            }
        }

        return httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
    }
}
