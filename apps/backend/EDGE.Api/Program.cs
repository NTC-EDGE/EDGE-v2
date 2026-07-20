using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.SignalR;
using Hangfire;
using Scalar.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Serilog;
using System.Text;
using EDGE.Application;
using EDGE.Application.Applications.Commands;
using EDGE.Application.Applications.Queries;
using EDGE.Application.Common.Interfaces;
using EDGE.Infrastructure;
using EDGE.Infrastructure.Hubs;
using EDGE.Infrastructure.Authorization;
using EDGE.Domain.Authorization;
using EDGE.Api.Services;
using EDGE.Api.Endpoints;

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .WriteTo.File("logs/edge_api_log-.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();

try
{
    Log.Information("Starting NTC-EDGE Web API...");

    var builder = WebApplication.CreateBuilder(args);

    // Use Serilog for application logging
    builder.Host.UseSerilog();

    // Add HTTP context accessor (required for extracting active user session details)
    builder.Services.AddHttpContextAccessor();
    builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();

    // Add Clean Architecture layers
    builder.Services.AddApplication();
    builder.Services.AddInfrastructure();

    // Configure Clerk JWT Authentication (with Mock Bypass Fallback in Dev)
    builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddJwtBearer(options =>
        {
            options.Authority = builder.Configuration["Clerk:Authority"] ?? "https://easy-snipe-36.clerk.accounts.dev";
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuer = builder.Configuration["Clerk:Authority"] ?? "https://easy-snipe-36.clerk.accounts.dev",
                ValidateAudience = false,
                ValidateLifetime = true,
                NameClaimType = System.Security.Claims.ClaimTypes.NameIdentifier
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

                        var claims = new System.Security.Claims.Claim[]
                        {
                            new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.NameIdentifier, authUserId)
                        };
                        var identity = new System.Security.Claims.ClaimsIdentity(claims, "MockAuth");
                        context.Principal = new System.Security.Claims.ClaimsPrincipal(identity);
                        context.Success();
                    }
                    return Task.CompletedTask;
                }
            };
        });

    builder.Services.AddDynamicAuthorization();

    // Configure OpenAPI
    builder.Services.AddOpenApi();

    var app = builder.Build();

    app.UseAuthentication();
    app.UseAuthorization();

    // Configure HTTP request pipeline
    if (app.Environment.IsDevelopment())
    {
        app.MapOpenApi();
        app.MapScalarApiReference();
        app.UseHangfireDashboard("/hangfire");
    }

    app.MapApiEndpoints();
8
    app.MapGet("/", () => "NTC-EDGE Clean Architecture API (.NET 10)");

    // Map SignalR Hub
    app.MapHub<NotificationHub>("/hubs/notifications");

    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Host terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}
