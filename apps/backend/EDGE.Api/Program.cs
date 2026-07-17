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
using EDGE.Application.Auth.Commands.Login;
using EDGE.Application.Common.Interfaces;
using EDGE.Infrastructure;
using EDGE.Infrastructure.Hubs;
using EDGE.Infrastructure.Authorization;
using EDGE.Domain.Authorization;
using EDGE.Api.Services;

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
        });

    builder.Services.AddDynamicAuthorization();
    builder.Services.AddControllers();

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

    app.MapControllers();

    app.MapGet("/", () => "NTC-EDGE Clean Architecture API (.NET 10)");

    // Minimal API Endpoint for Application Creation
    app.MapPost("/api/applications", async (
        CreateApplicationCommand command,
        IValidator<CreateApplicationCommand> validator,
        IMediator mediator,
        IBackgroundJobClient backgroundJobs,
        IHubContext<NotificationHub> hubContext) =>
    {
        var validationResult = await validator.ValidateAsync(command);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        var result = await mediator.Send(command);

        // Queue a Hangfire background job
        backgroundJobs.Enqueue(() => Console.WriteLine($"[Hangfire Job] Processed application: {result.Title} by {result.ApplicantName}"));

        // Broadcast SignalR notification
        await hubContext.Clients.All.SendAsync("ReceiveNotification", $"New application submitted: '{result.Title}'");

        return Results.Created($"/api/applications/{result.Id}", result);
    })
    .WithName("CreateApplication")
    .RequireAuthorization(Policies.CanSubmitApplication);

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
