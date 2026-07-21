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

        try
        {
            using var scope = _serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            // 1. Run migrations first
            var appliedMigrations = (await context.Database.GetAppliedMigrationsAsync(cancellationToken)).ToList();
            var pendingMigrations = (await context.Database.GetPendingMigrationsAsync(cancellationToken)).ToList();

            _logger.LogInformation("Found {Count} applied migration(s) in database: [{Applied}]", appliedMigrations.Count, string.Join(", ", appliedMigrations));

            if (pendingMigrations.Count > 0)
            {
                _logger.LogInformation("Applying {Count} pending migration(s): [{Pending}]", pendingMigrations.Count, string.Join(", ", pendingMigrations));
                await context.Database.MigrateAsync(cancellationToken);
                _logger.LogInformation("Database migrations applied successfully.");
            }
            else
            {
                _logger.LogInformation("No pending database migrations found. Database schema is up to date.");
            }

            // 2. Seed IAM reference data (Roles, Permissions, RolePermissions, default Users)
            _logger.LogInformation("Seeding database IAM reference data...");
            await RolePermissionDataSeeder.SeedAsync(context);
            _logger.LogInformation("IAM seed data completed.");

            // 3. Seed geographic reference data
            _logger.LogInformation("Seeding database geographic reference data...");
            await GeographicDataSeeder.SeedAsync(context);
            _logger.LogInformation("Geographic seed data completed.");

            // 4. Seed catalog hierarchy (ServiceCategory → Service → ServiceVariant)
            _logger.LogInformation("Seeding catalog hierarchy reference data...");
            await CatalogDataSeeder.SeedAsync(context);
            _logger.LogInformation("Catalog seed data completed.");

        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred during database initialization.");
            throw;
        }
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
}
