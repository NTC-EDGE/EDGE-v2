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
            if (configuration?.GetValue<bool>("ResetDatabase") == true || Environment.GetEnvironmentVariable("RESET_DATABASE") == "true")
            {
                _logger.LogWarning("RESET_DATABASE requested. Dropping public schema...");
                await context.Database.ExecuteSqlRawAsync("DROP SCHEMA public CASCADE; CREATE SCHEMA public;", cancellationToken);
                _logger.LogInformation("Public schema dropped and recreated successfully.");
            }

            _logger.LogInformation("Applying database migrations...");
            await context.Database.MigrateAsync(cancellationToken);
            _logger.LogInformation("Database migrations applied successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Database migration failed.");
            throw;
        }

        // 2. Seed geographic reference data first (Regions are required by Tenants in IAM seeder)
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

        // 3. Seed IAM reference data (Roles, Permissions, RolePermissions, Tenants, default Users)
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

        // 5. Seed Feedback data (100+ feedback instances with anonymous options)
        try
        {
            _logger.LogInformation("Seeding Feedback entries (100 instances)...");
            await FeedbackDataSeeder.SeedAsync(context);
            _logger.LogInformation("Feedback entries seeded successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Feedback seed data encountered an issue.");
        }

        // 6. Seed System Announcements and Audit Logs
        try
        {
            _logger.LogInformation("Seeding System Announcements...");
            await SystemAnnouncementDataSeeder.SeedAsync(context);
            _logger.LogInformation("System Announcements seeded successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "System Announcements/Audit Logs seed data encountered an issue.");
        }

        // 7. Seed Notification Templates (External & Internal)
        try
        {
            _logger.LogInformation("Seeding Notification Templates...");
            await NotificationTemplateDataSeeder.SeedAsync(context);
            _logger.LogInformation("Notification Templates seeded successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Notification Templates seed data encountered an issue.");
        }

        // 8. Seed Application dev data (Applications, SOAs, OPs, Histories)
        try
        {
            _logger.LogInformation("Seeding Application dev data...");
            await ApplicationDataSeeder.SeedAsync(context);
            _logger.LogInformation("Application dev data seeded successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Application dev data seed encountered an issue.");
            throw;
        }

        // 9. Seed Service Information entries
        try
        {
            _logger.LogInformation("Seeding Service Information entries...");
            await ServiceInformationDataSeeder.SeedAsync(context);
            _logger.LogInformation("Service Information entries seeded successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Service Information seed data encountered an issue.");
        }
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
}
