using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using System.IO;

namespace EDGE.Infrastructure.Persistence;

public class ApplicationDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    public ApplicationDbContext CreateDbContext(string[] args)
    {
        var env = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Development";

        // Try different base paths to find configuration files
        var basePaths = new[]
        {
            Directory.GetCurrentDirectory(),
            Path.Combine(Directory.GetCurrentDirectory(), "EDGE.Api"),
            Path.Combine(Directory.GetCurrentDirectory(), "..", "EDGE.Api"),
            Path.GetDirectoryName(typeof(ApplicationDbContextFactory).Assembly.Location) ?? Directory.GetCurrentDirectory()
        };

        ConfigurationBuilder configBuilder = new();

        foreach (var basePath in basePaths)
        {
            if (Directory.Exists(basePath))
            {
                configBuilder.SetBasePath(basePath);
                break;
            }
        }

        var configuration = configBuilder
            .AddJsonFile("appsettings.json", optional: true)
            .AddJsonFile($"appsettings.{env}.json", optional: true)
            .AddUserSecrets<ApplicationDbContextFactory>(optional: true) // Enables reading from secrets.json at design-time
            .AddEnvironmentVariables()
            .Build();

        var connectionString = configuration.GetConnectionString("DefaultConnection") 
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' was not found. Please configure 'ConnectionStrings:DefaultConnection' in User Secrets or environment variables.");

        var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();
        optionsBuilder.UseNpgsql(connectionString, x => x.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.GetName().Name));

        var dbContext = new ApplicationDbContext(optionsBuilder.Options);

        EnsureMigrationHistorySynced(dbContext);

        return dbContext;
    }

    public static void EnsureMigrationHistorySynced(DbContext context)
    {
        try
        {
            context.Database.ExecuteSqlRaw(@"
                CREATE TABLE IF NOT EXISTS public.""__EFMigrationsHistory"" (
                    ""MigrationId"" character varying(150) NOT NULL,
                    ""ProductVersion"" character varying(32) NOT NULL,
                    CONSTRAINT ""PK___EFMigrationsHistory"" PRIMARY KEY (""MigrationId"")
                );
            ");

            // Check which key tables/columns exist to determine what has already been applied
            var activityLogsExist = context.Database.SqlQueryRaw<bool>(@"
                SELECT EXISTS (
                    SELECT 1 FROM information_schema.tables
                    WHERE table_schema = 'public' AND table_name = 'ActivityLogs'
                );
            ").AsEnumerable().FirstOrDefault();

            var usersExist = context.Database.SqlQueryRaw<bool>(@"
                SELECT EXISTS (
                    SELECT 1 FROM information_schema.tables
                    WHERE table_schema = 'public' AND table_name = 'Users'
                );
            ").AsEnumerable().FirstOrDefault();

            var usersHasAuthUserId = context.Database.SqlQueryRaw<bool>(@"
                SELECT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema = 'public'
                      AND table_name = 'Users'
                      AND column_name = 'AuthUserId'
                );
            ").AsEnumerable().FirstOrDefault();

            var provincesExist = context.Database.SqlQueryRaw<bool>(@"
                SELECT EXISTS (
                    SELECT 1 FROM information_schema.tables
                    WHERE table_schema = 'public' AND table_name = 'Provinces'
                );
            ").AsEnumerable().FirstOrDefault();

            var tenantsExist = context.Database.SqlQueryRaw<bool>(@"
                SELECT EXISTS (
                    SELECT 1 FROM information_schema.tables
                    WHERE table_schema = 'public' AND table_name = 'Tenants'
                );
            ").AsEnumerable().FirstOrDefault();

            // --- AddUserAndSeed (creates ActivityLogs, AuditLogs, Applications, Users) ---
            // Mark as applied if ActivityLogs already exists (it was created by this migration
            // or by the old schema). Either way the migration must not re-run.
            if (activityLogsExist)
            {
                context.Database.ExecuteSqlRaw(@"
                    INSERT INTO public.""__EFMigrationsHistory"" (""MigrationId"", ""ProductVersion"")
                    VALUES ('20260717045851_AddUserAndSeed', '10.0.3')
                    ON CONFLICT (""MigrationId"") DO NOTHING;
                ");
            }

            // --- InitialCreate (creates Regions, Provinces, etc.) ---
            // If Provinces is missing, remove it from history so it re-runs.
            if (!provincesExist)
            {
                context.Database.ExecuteSqlRaw(@"
                    DELETE FROM public.""__EFMigrationsHistory""
                    WHERE ""MigrationId"" = '20260717070258_InitialCreate';
                ");
            }

            // --- AddUserExpandedProperties (ALTERs Users table: drops PasswordHash, adds AuthUserId etc.) ---
            // This migration REQUIRES Users table. If Users doesn't exist, skip it entirely by marking
            // it as applied — the subsequent MultiTenantRbacRefactor migration creates the proper Users
            // table structure from scratch via a full schema rebuild.
            // Only mark as applied if: Users table exists with AuthUserId (ran correctly),
            // OR ActivityLogs exists but Users does NOT (old-schema DB where Users was never in this form).
            if (usersHasAuthUserId || (activityLogsExist && !usersExist))
            {
                context.Database.ExecuteSqlRaw(@"
                    INSERT INTO public.""__EFMigrationsHistory"" (""MigrationId"", ""ProductVersion"")
                    VALUES ('20260720040039_AddUserExpandedProperties', '10.0.3')
                    ON CONFLICT (""MigrationId"") DO NOTHING;
                ");
            }

            // --- MultiTenantRbacRefactor (creates Tenants, rebuilds Users/Roles/Permissions) ---
            // Only mark as applied if Tenants table already exists.
            if (tenantsExist)
            {
                context.Database.ExecuteSqlRaw(@"
                    INSERT INTO public.""__EFMigrationsHistory"" (""MigrationId"", ""ProductVersion"")
                    VALUES ('20260720075942_MultiTenantRbacRefactor', '10.0.3')
                    ON CONFLICT (""MigrationId"") DO NOTHING;
                ");
            }
        }
        catch
        {
            // Ignore errors if DB is uninitialized or unreachable
        }
    }
}
