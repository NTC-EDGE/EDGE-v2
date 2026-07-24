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
            // 1. Create migration history table if it doesn't exist
            context.Database.ExecuteSqlRaw(@"
                CREATE TABLE IF NOT EXISTS public.""__EFMigrationsHistory"" (
                    ""MigrationId"" character varying(150) NOT NULL,
                    ""ProductVersion"" character varying(32) NOT NULL,
                    CONSTRAINT ""PK___EFMigrationsHistory"" PRIMARY KEY (""MigrationId"")
                );
            ");

            // 2. Check if the initial migration tables already exist (e.g., ActivityLogs)
            var tableExists = false;
            try
            {
                using var command = context.Database.GetDbConnection().CreateCommand();
                command.CommandText = @"
                    SELECT EXISTS (
                        SELECT 1 FROM information_schema.tables 
                        WHERE table_schema = 'public' 
                        AND table_name = 'ActivityLogs'
                    );";
                context.Database.OpenConnection();
                var result = command.ExecuteScalar();
                context.Database.CloseConnection();
                tableExists = result is bool b && b;
            }
            catch
            {
                // If query fails, assume table does not exist or db is uninitialized
            }

            // 3. If tables exist, seed history entries so EF does not attempt to recreate existing tables
            if (tableExists)
            {
                context.Database.ExecuteSqlRaw(@"
                    INSERT INTO public.""__EFMigrationsHistory"" (""MigrationId"", ""ProductVersion"") 
                    VALUES 
                    ('20260722053305_AddFeesAndServiceFees', '10.0.5'),
                    ('20260722070017_InitialCreate', '10.0.5'),
                    ('20260722073100_AddTenantIdToFieldOffice', '10.0.5'),
                    ('20260722074148_ChangeOfficerInChargeToGuid', '10.0.5')
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
