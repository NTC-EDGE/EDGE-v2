using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using System.IO;

namespace EDGE.Infrastructure.Persistence;

public class ApplicationDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    public ApplicationDbContext CreateDbContext(string[] args)
    {
        var env = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production";

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
            .AddUserSecrets<ApplicationDbContextFactory>() // Enables reading from secrets.json at design-time
            .AddEnvironmentVariables()
            .Build();

        var connectionString = configuration.GetConnectionString("DefaultConnection") 
            ?? "Host=localhost;Database=edge_v2_db;Username=postgres;Password=postgres";

        var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();
        optionsBuilder.UseNpgsql(connectionString, x => x.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.GetName().Name));

        return new ApplicationDbContext(optionsBuilder.Options);
    }
}
