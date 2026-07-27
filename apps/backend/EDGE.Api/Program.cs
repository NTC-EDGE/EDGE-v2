using System.Linq;
using Hangfire;
using Scalar.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Serilog;
using System.Text;
using EDGE.Application;
using EDGE.Application.Common.Interfaces;
using EDGE.Infrastructure;
using EDGE.Infrastructure.Hubs;
using EDGE.Infrastructure.Authorization;
using EDGE.Domain.Authorization;
using EDGE.Api.Middleware;
using EDGE.Api.Services;
using EDGE.Api.Endpoints;
using EDGE.Infrastructure.Printing.Services.Initialization;

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

    // Register all IExceptionStrategy implementations automatically from the executing assembly
    builder.Services.AddExceptionStrategies();

    // Configure Clerk JWT Authentication (with Mock Bypass Fallback in Dev)
    builder.Services.AddClerkAuthentication(builder.Configuration);

    builder.Services.AddDynamicAuthorization();
    builder.Services.ConfigureHttpJsonOptions(options =>
    {
        options.SerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

    // Configure OpenAPI
    builder.Services.AddOpenApi();

    // Configure CORS
    builder.Services.AddApiCors(builder.Configuration);

    var app = builder.Build();

    // Initialize PDF engine libraries (e.g. iText 7 license configuration)
    app.Services.InitializePdfLibraries();

    // Use global exception handling middleware
    app.UseMiddleware<ExceptionHandlingMiddleware>();

    app.UseApiCors();

    app.UseAuthentication();
    app.UseAuthorization();

    // Configure HTTP request pipeline
    if (app.Environment.IsDevelopment())
    {
        app.MapOpenApi();
        app.MapScalarApiReference("/scalar/v2");
        app.UseHangfireDashboard("/hangfire");
    }

    app.MapApiEndpoints();

    app.MapGet("/", () => "NTC-EDGE Clean Architecture API (.NET 10)");

    // Map SignalR Hub
    app.MapHub<NotificationHub>("/hubs/notifications");

    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Host terminated unexpectedly");
    throw;
}
finally
{
    Log.CloseAndFlush();
}

public partial class Program { }

