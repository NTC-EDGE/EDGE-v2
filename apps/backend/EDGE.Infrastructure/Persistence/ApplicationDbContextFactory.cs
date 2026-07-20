using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using System.IO;

namespace EDGE.Infrastructure.Persistence;

public class ApplicationDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    public ApplicationDbContext CreateDbContext(string[] args)
    {
        // Adjust directory path based on where the CLI command is run
        var currentDir = Directory.GetCurrentDirectory();
        var basePath = currentDir;

        if (Path.GetFileName(currentDir) == "backend")
        {
            basePath = Path.Combine(currentDir, "EDGE.Api");
        }
        else if (Path.GetFileName(currentDir) == "EDGE.Infrastructure")
        {
            basePath = Path.Combine(currentDir, "../EDGE.Api");
        }

        var configuration = new ConfigurationBuilder()
            .SetBasePath(basePath)
            .AddJsonFile("appsettings.json", optional: true)
            .AddJsonFile("appsettings.Development.json", optional: true)
            .AddUserSecrets("57d677f4-ed2b-4a3e-9089-80ef049dd2f7")
            .AddEnvironmentVariables()
            .Build();

        var connectionString = configuration.GetConnectionString("DefaultConnection");

        var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();
        optionsBuilder.UseNpgsql(connectionString);

        return new ApplicationDbContext(optionsBuilder.Options);
    }
}
