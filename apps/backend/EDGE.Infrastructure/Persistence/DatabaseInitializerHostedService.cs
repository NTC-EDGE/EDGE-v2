using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;

namespace EDGE.Infrastructure.Persistence;

public class DatabaseInitializerHostedService : IHostedService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<DatabaseInitializerHostedService> _logger;

    public DatabaseInitializerHostedService(
        IServiceProvider serviceProvider,
        ILogger<DatabaseInitializerHostedService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("Starting database initialization (migrations & seeding)...");

        using var scope = _serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var configuration = scope.ServiceProvider.GetService<IConfiguration>();
        // 1. Run migrations first
        try
        {
            _logger.LogInformation("Applying database migrations...");
            ApplicationDbContextFactory.EnsureMigrationHistorySynced(context);
            await context.Database.MigrateAsync(cancellationToken);
            _logger.LogInformation("Database migrations applied successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Database migration failed.");
            throw;
        }

        // 2. Seed IAM reference data (Roles, Permissions, RolePermissions, default Users)
        try
        {
            _logger.LogInformation("Seeding database IAM reference data...");
            await RolePermissionDataSeeder.SeedAsync(context);
            _logger.LogInformation("IAM seed data completed.");
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "IAM seed data encountered an issue.");
            throw new InvalidOperationException("IAM seed data failed. Please check the logs for details.", ex);
        }

        // 3. Seed geographic reference data
        try
        {
            _logger.LogInformation("Seeding database geographic reference data...");
            await GeographicDataSeeder.SeedAsync(context);
            _logger.LogInformation("Geographic seed data completed.");
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Geographic seed data encountered an issue.");
            throw new InvalidOperationException("Geographic seed data failed. Please check the logs for details.", ex);
        }

        // 4. Seed Fast-Track catalog data (ServiceCategory, Service, ServiceVariant, Form templates, etc.)
        try
        {
            _logger.LogInformation("Seeding Fast-Track catalog data...");
            await FastTrackSeeder.SeedAsync(context);
            _logger.LogInformation("Fast-Track catalog data seeded successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Fast-Track seed data encountered an issue.");
            throw new InvalidOperationException("Fast-Track seed data failed. Please check the logs for details.", ex);
        }
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
}
