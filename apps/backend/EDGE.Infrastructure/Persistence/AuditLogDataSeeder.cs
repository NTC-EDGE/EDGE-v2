using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using EDGE.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace EDGE.Infrastructure.Persistence;

public static class AuditLogDataSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        if (await context.AuditLogs.AnyAsync())
        {
            return;
        }

        var baseTime = DateTime.UtcNow;

        var auditLogs = new List<AuditLog>
        {
            new()
            {
                Id = Guid.Parse("80000000-0000-0000-0000-000000000001"),
                Action = "CREATE_ROLE",
                EntityName = "Role",
                ChangedBy = "user_admin123",
                ChangedAt = baseTime.AddHours(-12),
                KeyValues = "{\"Id\":\"10000000-0000-0000-0000-000000000006\"}",
                NewValues = "{\"Name\":\"Administrator\",\"Key\":\"admin\",\"TenantId\":\"00000000-0000-0000-0000-000000000001\"}"
            },
            new()
            {
                Id = Guid.Parse("80000000-0000-0000-0000-000000000002"),
                Action = "ASSIGN_PERMISSION",
                EntityName = "RolePermission",
                ChangedBy = "user_admin123",
                ChangedAt = baseTime.AddHours(-11),
                KeyValues = "{\"RoleId\":\"10000000-0000-0000-0000-000000000006\"}",
                NewValues = "{\"RoleId\":\"10000000-0000-0000-0000-000000000006\",\"PermissionKey\":\"Permissions.ManageTenants\"}"
            },
            new()
            {
                Id = Guid.Parse("80000000-0000-0000-0000-000000000003"),
                Action = "UPDATE_REGIONAL_CONFIG",
                EntityName = "Tenant",
                ChangedBy = "user_admin123",
                ChangedAt = baseTime.AddHours(-8),
                KeyValues = "{\"Id\":\"00000000-0000-0000-0000-000000000001\"}",
                NewValues = "{\"Name\":\"NTC Central Office\",\"Director\":\"Engr. Teodoro D. Buenavista Jr.\"}"
            },
            new()
            {
                Id = Guid.Parse("80000000-0000-0000-0000-000000000004"),
                Action = "PUBLISH_ANNOUNCEMENT",
                EntityName = "SystemAnnouncement",
                ChangedBy = "user_admin123",
                ChangedAt = baseTime.AddHours(-4),
                KeyValues = "{\"Id\":\"70000000-0000-0000-0000-000000000001\"}",
                NewValues = "{\"Title\":\"Scheduled System Maintenance\",\"Type\":\"Maintenance\"}"
            },
            new()
            {
                Id = Guid.Parse("80000000-0000-0000-0000-000000000005"),
                Action = "CREATE_FORM_TEMPLATE",
                EntityName = "FormTemplate",
                ChangedBy = "user_admin123",
                ChangedAt = baseTime.AddHours(-1),
                KeyValues = "{\"Id\":\"50000000-0000-0000-0000-000000000001\"}",
                NewValues = "{\"FormCode\":\"NTC-FORM-101\",\"Title\":\"Permit to Purchase Radio Transmitter\"}"
            }
        };

        await context.AuditLogs.AddRangeAsync(auditLogs);
        await context.SaveChangesAsync();
    }
}
