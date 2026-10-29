using Hangfire;
using Serilog;
using EDGE.Application;
using EDGE.Application.Common.Interfaces;
using EDGE.Infrastructure;
using EDGE.Infrastructure.Hubs;
using EDGE.Infrastructure.Authorization;
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
        options.SerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
        options.SerializerOptions.Converters.Add(new EDGE.Application.Common.JsonConverters.FlexibleDateOnlyJsonConverter());
        options.SerializerOptions.Converters.Add(new EDGE.Application.Common.JsonConverters.FlexibleNullableDateOnlyJsonConverter());
        options.SerializerOptions.Converters.Add(new EDGE.Application.Common.JsonConverters.FlexibleGuidJsonConverter());
        options.SerializerOptions.Converters.Add(new EDGE.Application.Common.JsonConverters.FlexibleNullableGuidJsonConverter());
    });

    // Configure OpenAPI
    builder.Services.AddApiOpenApi();

    // Configure CORS
    builder.Services.AddApiCors(builder.Configuration);

    var app = builder.Build();

    // Initialize PDF engine libraries (e.g. iText 7 license configuration)
    app.Services.InitializePdfLibraries();

    // Use global exception handling middleware
    app.UseMiddleware<ExceptionHandlingMiddleware>();

    app.UseApiCors();

    // Prevent browser HTTP disk/memory caching on dynamic API responses
    app.Use(async (context, next) =>
    {
        if (context.Request.Path.StartsWithSegments("/api"))
        {
            context.Response.OnStarting(() =>
            {
                context.Response.Headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0";
                context.Response.Headers["Pragma"] = "no-cache";
                context.Response.Headers["Expires"] = "0";
                return Task.CompletedTask;
            });
        }
        await next();
    });

    app.UseAuthentication();
    app.UseAuthorization();

    // Configure HTTP request pipeline
    if (app.Environment.IsDevelopment())
    {
        app.MapOpenApi();
        app.UseApiScalar();
        app.UseHangfireDashboard("/hangfire");
    }

    app.MapApiEndpoints();

    app.MapGet("/", () => "NTC-EDGE Clean Architecture API (.NET 10)");

    // Map SignalR Hubs
    app.MapHub<NotificationHub>("/hubs/notifications");
    app.MapHub<ChatHub>("/hubs/chat");
    app.MapHub<MeetingHub>("/hubs/meet");

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

