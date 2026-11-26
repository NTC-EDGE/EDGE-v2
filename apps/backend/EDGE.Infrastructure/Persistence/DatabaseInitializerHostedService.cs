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
        var environment = scope.ServiceProvider.GetService<IHostEnvironment>();

        // 1. Run migrations first
        try
        {
            if (configuration?.GetValue<bool>("ResetDatabase") == true || Environment.GetEnvironmentVariable("RESET_DATABASE") == "true")
            {
                _logger.LogWarning("RESET_DATABASE requested. Dropping public schema...");
                await context.Database.ExecuteSqlRawAsync("DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA IF NOT EXISTS public; GRANT ALL ON SCHEMA public TO CURRENT_USER; GRANT ALL ON SCHEMA public TO public;", cancellationToken);
                _logger.LogInformation("Public schema dropped and recreated successfully.");
            }

            // Guard: if tables were already created by pre-consolidated migrations or schema dump,
            // ensure __EFMigrationsHistory records the consolidated '20261117084720_InitialCreate' baseline
            // so MigrateAsync does not attempt to re-create existing tables (which causes Postgres 42P07 and crashes startup).
            if (context.Database.IsNpgsql())
            {
                await context.Database.ExecuteSqlRawAsync("""
                    CREATE SCHEMA IF NOT EXISTS public;
                    SET search_path TO public;

                    CREATE TABLE IF NOT EXISTS public."__EFMigrationsHistory" (
                        "MigrationId" character varying(150) NOT NULL,
                        "ProductVersion" character varying(32) NOT NULL,
                        CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId")
                    );

                    INSERT INTO public."__EFMigrationsHistory" ("MigrationId", "ProductVersion")
                    SELECT '20261117084720_InitialCreate', '10.0.0'
                    WHERE EXISTS (
                        SELECT 1 FROM information_schema.tables
                        WHERE table_schema = 'public' AND table_name = 'ActivityLogs'
                    )
                    AND NOT EXISTS (
                        SELECT 1 FROM public."__EFMigrationsHistory"
                        WHERE "MigrationId" = '20261117084720_InitialCreate'
                    );
                    """, cancellationToken);
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
            _logger.LogError(ex, "Geographic seed data failed.");
            throw new InvalidOperationException("Geographic seed data failed. Please check the logs for details.", ex);
        }

        // 3. Seed IAM reference data (Roles, Permissions, RolePermissions, Default Tenant, Initial SuperAdmin; Demo Users in Dev only)
        try
        {
            _logger.LogInformation("Seeding database IAM reference data...");
            var clerkUserService = scope.ServiceProvider.GetService<EDGE.Application.Common.Interfaces.IClerkUserService>();
            var strictClerkSync = configuration?.GetValue<bool>("Seeding:StrictClerkSync") == true;
            var seedDemoUsers = environment?.IsDevelopment() == true || configuration?.GetValue<bool>("Seeding:SeedDemoUsers") == true;

            await RolePermissionDataSeeder.SeedAsync(
                context,
                forceResetPermissions: true,
                clerkUserService: clerkUserService,
                logger: _logger,
                throwOnPartialFailure: strictClerkSync,
                seedDemoUsers: seedDemoUsers);
            _logger.LogInformation("IAM seed data completed.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "IAM seed data failed.");
            throw new InvalidOperationException("IAM seed data failed. Please check the logs for details.", ex);
        }

        // 4. Seed Fast-Track catalog data (ServiceCategory, Service, ServiceVariant, ServiceInformation, Form templates, etc.)
        try
        {
            _logger.LogInformation("Seeding Fast-Track catalog data...");
            await FastTrackSeeder.SeedAsync(context, _logger);
            _logger.LogInformation("Fast-Track catalog data seeded successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Fast-Track seed data encountered an issue. Continuing startup so API remains available.");
        }

        // 5. Seed Notification Templates (External & Internal)
        try
        {
            _logger.LogInformation("Seeding Notification Templates...");
            await NotificationTemplateDataSeeder.SeedAsync(context);
            _logger.LogInformation("Notification Templates seeded successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Notification Templates seed data encountered an issue.");
        }

        // 6. Seed System Configuration entries
        try
        {
            _logger.LogInformation("Seeding System Configuration entries...");
            await SystemConfigDataSeeder.SeedAsync(context);
            _logger.LogInformation("System Configuration entries seeded successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "System Configuration seed data encountered an issue.");
        }
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
}
