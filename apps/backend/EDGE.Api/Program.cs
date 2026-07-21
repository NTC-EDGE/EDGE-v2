using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.SignalR;
using Hangfire;
using Scalar.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Serilog;
using EDGE.Application;

using EDGE.Application.Common.Interfaces;
using EDGE.Infrastructure;
using EDGE.Infrastructure.Hubs;
using EDGE.Api.Middleware;
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



    // Configure Clerk JWT Authentication
    var clerkAuthority = builder.Configuration["Clerk:Authority"] ?? "https://easy-snipe-36.clerk.accounts.dev";
    builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddJwtBearer(options =>
        {
            options.Authority = clerkAuthority;
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuer = clerkAuthority,
                ValidateAudience = false,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                RoleClaimType = "role"
            };
        });

    builder.Services.AddAuthorization(options =>
    {
        options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
    });

    // Configure OpenAPI
    builder.Services.AddOpenApi();

    var app = builder.Build();

    // Use global exception handling middleware
    app.UseMiddleware<ExceptionHandlingMiddleware>();

    app.UseAuthentication();
    app.UseAuthorization();

    // Configure HTTP request pipeline
    if (app.Environment.IsDevelopment())
    {
        app.MapOpenApi();
        app.MapScalarApiReference();
        app.UseHangfireDashboard("/hangfire");
    }

    app.MapGet("/", () => "NTC-EDGE Clean Architecture API (.NET 10)");



    // Map Minimal API Endpoint Groups (Geographic CRUD: Regions, Provinces, Municipalities, Barangays)
    app.MapRegionEndpoints();
    app.MapProvinceEndpoints();
    app.MapMunicipalityEndpoints();
    app.MapBarangayEndpoints();

    app.MapApplicationEndpoints();

    // Map SignalR Hub
    app.MapHub<NotificationHub>("/hubs/notifications");

    // Seed geographic reference data on startup
    await app.SeedDatabaseAsync();

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
