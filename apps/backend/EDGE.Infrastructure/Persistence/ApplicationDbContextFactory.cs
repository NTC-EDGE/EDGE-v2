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

            var activityLogsExist = context.Database.SqlQueryRaw<bool>(@"
                SELECT EXISTS (
                    SELECT 1 FROM information_schema.tables 
                    WHERE table_schema = 'public' AND table_name = 'ActivityLogs'
                );
            ").AsEnumerable().FirstOrDefault();

            if (activityLogsExist)
            {
                context.Database.ExecuteSqlRaw(@"
                    INSERT INTO public.""__EFMigrationsHistory"" (""MigrationId"", ""ProductVersion"")
                    VALUES 
                        ('20260717045851_AddUserAndSeed', '10.0.3'),
                        ('20260717070258_InitialCreate', '10.0.3')
                    ON CONFLICT (""MigrationId"") DO NOTHING;
                ");
            }

            var permissionsExist = context.Database.SqlQueryRaw<bool>(@"
                SELECT EXISTS (
                    SELECT 1 FROM information_schema.tables 
                    WHERE table_schema = 'public' AND table_name = 'Permissions'
                );
            ").AsEnumerable().FirstOrDefault();

            if (permissionsExist)
            {
                context.Database.ExecuteSqlRaw(@"
                    INSERT INTO public.""__EFMigrationsHistory"" (""MigrationId"", ""ProductVersion"")
                    VALUES ('20260720040039_AddUserExpandedProperties', '10.0.3')
                    ON CONFLICT (""MigrationId"") DO NOTHING;
                ");
            }

            var tenantsExist = context.Database.SqlQueryRaw<bool>(@"
                SELECT EXISTS (
                    SELECT 1 FROM information_schema.tables 
                    WHERE table_schema = 'public' AND table_name = 'Tenants'
                );
            ").AsEnumerable().FirstOrDefault();

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
