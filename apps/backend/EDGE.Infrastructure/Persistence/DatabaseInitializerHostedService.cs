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
                await context.Database.ExecuteSqlRawAsync("DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA IF NOT EXISTS public; GRANT ALL ON SCHEMA public TO CURRENT_USER; GRANT ALL ON SCHEMA public TO public;", cancellationToken);
                _logger.LogInformation("Public schema dropped and recreated successfully.");
            }

            // Guard: if tables were already created outside of EF migrations (e.g. via schema dump),
            // ensure __EFMigrationsHistory exists and has the InitialCreate entry recorded so that
            // MigrateAsync does not attempt to re-create existing tables (which causes 42P07).
            // Also backfill any columns added to the migration that may be missing from an older schema.
            await context.Database.ExecuteSqlRawAsync("""
                CREATE SCHEMA IF NOT EXISTS public;
                SET search_path TO public;

                CREATE TABLE IF NOT EXISTS public."__EFMigrationsHistory" (
                    "MigrationId" character varying(150) NOT NULL,
                    "ProductVersion" character varying(32) NOT NULL,
                    CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId")
                );

                INSERT INTO public."__EFMigrationsHistory" ("MigrationId", "ProductVersion")
                SELECT '20260813070918_InitialCreate', '9.0.0'
                WHERE EXISTS (
                    SELECT 1 FROM information_schema.tables
                    WHERE table_schema = 'public' AND table_name = 'ActivityLogs'
                )
                AND NOT EXISTS (
                    SELECT 1 FROM public."__EFMigrationsHistory"
                    WHERE "MigrationId" = '20260813070918_InitialCreate'
                );

                -- Backfill columns that exist in the current migration but may be missing from older DB schemas
                DO $$ BEGIN
                    IF EXISTS (
                        SELECT 1 FROM information_schema.tables
                        WHERE table_schema = 'public' AND table_name = 'Applicants'
                    ) THEN
                        ALTER TABLE public."Applicants"
                            ADD COLUMN IF NOT EXISTS "ServiceId" uuid NULL;

                        CREATE INDEX IF NOT EXISTS "IX_Applicants_ServiceId" ON public."Applicants" ("ServiceId");

                        IF NOT EXISTS (
                            SELECT 1 FROM information_schema.table_constraints
                            WHERE constraint_schema = 'public'
                            AND constraint_name = 'FK_Applicants_Services_ServiceId'
                            AND table_name = 'Applicants'
                        ) THEN
                            ALTER TABLE public."Applicants"
                            ADD CONSTRAINT "FK_Applicants_Services_ServiceId"
                            FOREIGN KEY ("ServiceId") REFERENCES public."Services" ("Id");
                        END IF;
                    END IF;

                    IF EXISTS (
                        SELECT 1 FROM information_schema.tables
                        WHERE table_schema = 'public' AND table_name = 'ServiceVariants'
                    ) THEN
                        ALTER TABLE public."ServiceVariants"
                            ADD COLUMN IF NOT EXISTS "IsIndividual" boolean NOT NULL DEFAULT true;
                    END IF;

                    IF EXISTS (
                        SELECT 1 FROM information_schema.tables
                        WHERE table_schema = 'public' AND table_name = 'Requirements'
                    ) THEN
                        ALTER TABLE public."Requirements"
                            ALTER COLUMN "Description" TYPE text;
                    END IF;
                END $$;
                """, cancellationToken);

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

        // 3. Seed IAM reference data (Roles, Permissions, RolePermissions, Tenants, default Users)
        try
        {
            _logger.LogInformation("Seeding database IAM reference data...");
            await RolePermissionDataSeeder.SeedAsync(context);
            _logger.LogInformation("IAM seed data completed.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "IAM seed data failed.");
            throw new InvalidOperationException("IAM seed data failed. Please check the logs for details.", ex);
        }

        // 4. Seed Fast-Track catalog data (ServiceCategory, Service, ServiceVariant, Form templates, etc.)
        try
        {
            _logger.LogInformation("Seeding Fast-Track catalog data...");
            await FastTrackSeeder.SeedAsync(context, _logger);
            _logger.LogInformation("Fast-Track catalog data seeded successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Fast-Track seed data failed.");
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
            _logger.LogError(ex, "Feedback seed data encountered an issue.");
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
            _logger.LogError(ex, "System Announcements/Audit Logs seed data encountered an issue.");
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
            _logger.LogError(ex, "Notification Templates seed data encountered an issue.");
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
            _logger.LogError(ex, "Service Information seed data encountered an issue.");
        }
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
}
