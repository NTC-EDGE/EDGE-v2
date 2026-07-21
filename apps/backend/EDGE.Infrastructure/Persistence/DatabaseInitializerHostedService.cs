using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

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
            _logger.LogWarning(ex, "Database migration skipped or encountered an existing table/schema issue.");
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
        }
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
}
