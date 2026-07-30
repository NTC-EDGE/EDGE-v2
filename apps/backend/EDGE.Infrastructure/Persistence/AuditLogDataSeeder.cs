using System.Threading.Tasks;

namespace EDGE.Infrastructure.Persistence;

public static class AuditLogDataSeeder
{
    public static Task SeedAsync(ApplicationDbContext context)
    {
        // Real audit log entries are generated automatically by AuditableEntitySaveChangesInterceptor on actual system actions.
        return Task.CompletedTask;
    }
}
