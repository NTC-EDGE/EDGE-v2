using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using EDGE.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Npgsql;

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
            new() { Id = Guid.Parse("80000000-0000-0000-0000-000000000001"), Action = "User Login", Event = "User Login", EntityName = "Auth", ChangedBy = "admin@ntc.gov.ph", Resource = "/auth/login", IpAddress = "192.168.1.105", Status = "Success", Type = "Auth", ChangedAt = baseTime.AddMinutes(-10) },
            new() { Id = Guid.Parse("80000000-0000-0000-0000-000000000002"), Action = "Role Policy Updated", Event = "Role Policy Updated", EntityName = "Role", ChangedBy = "admin@ntc.gov.ph", Resource = "/roles/Admin", IpAddress = "192.168.1.105", Status = "Success", Type = "Security", ChangedAt = baseTime.AddMinutes(-25) },
            new() { Id = Guid.Parse("80000000-0000-0000-0000-000000000003"), Action = "Employee Record Edit", Event = "Employee Record Edit", EntityName = "Employee", ChangedBy = "hr@ntc.gov.ph", Resource = "/employees/EMP-0042", IpAddress = "10.0.0.88", Status = "Success", Type = "Data", ChangedAt = baseTime.AddMinutes(-45) },
            new() { Id = Guid.Parse("80000000-0000-0000-0000-000000000004"), Action = "Failed Login Attempt", Event = "Failed Login Attempt", EntityName = "Auth", ChangedBy = "unknown", Resource = "/auth/login", IpAddress = "203.0.113.42", Status = "Error", Type = "Auth", ChangedAt = baseTime.AddHours(-1) },
            new() { Id = Guid.Parse("80000000-0000-0000-0000-000000000005"), Action = "Announcement Created", Event = "Announcement Created", EntityName = "SystemAnnouncement", ChangedBy = "admin@ntc.gov.ph", Resource = "/announcements/ANN-019", IpAddress = "192.168.1.105", Status = "Success", Type = "System", ChangedAt = baseTime.AddHours(-2) },
            new() { Id = Guid.Parse("80000000-0000-0000-0000-000000000006"), Action = "License Approved", Event = "License Approved", EntityName = "Application", ChangedBy = "evaluator@ntc.ph", Resource = "/applications/APP-2026-0521", IpAddress = "172.16.0.22", Status = "Success", Type = "Data", ChangedAt = baseTime.AddHours(-3) },
            new() { Id = Guid.Parse("80000000-0000-0000-0000-000000000007"), Action = "Report Exported", Event = "Report Exported", EntityName = "Report", ChangedBy = "director@ntc.gov.ph", Resource = "/reports/export/q2-2026", IpAddress = "10.0.0.55", Status = "Success", Type = "System", ChangedAt = baseTime.AddHours(-4) },
            new() { Id = Guid.Parse("80000000-0000-0000-0000-000000000008"), Action = "Unauthorized Access", Event = "Unauthorized Access", EntityName = "Security", ChangedBy = "cashier@ntc.ph", Resource = "/admin/system-config", IpAddress = "10.0.0.71", Status = "Error", Type = "Security", ChangedAt = baseTime.AddHours(-5) },
            new() { Id = Guid.Parse("80000000-0000-0000-0000-000000000009"), Action = "Password Changed", Event = "Password Changed", EntityName = "User", ChangedBy = "user@ntc.gov.ph", Resource = "/account/password", IpAddress = "192.168.1.88", Status = "Success", Type = "User", ChangedAt = baseTime.AddHours(-6) },
            new() { Id = Guid.Parse("80000000-0000-0000-0000-000000000010"), Action = "Session Timeout", Event = "Session Timeout", EntityName = "Auth", ChangedBy = "legal@ntc.gov.ph", Resource = "/auth/session", IpAddress = "10.0.0.33", Status = "Warning", Type = "Auth", ChangedAt = baseTime.AddHours(-7) },
            new() { Id = Guid.Parse("80000000-0000-0000-0000-000000000011"), Action = "User Account Created", Event = "User Account Created", EntityName = "User", ChangedBy = "admin@ntc.gov.ph", Resource = "/users/USR-0188", IpAddress = "192.168.1.105", Status = "Success", Type = "User", ChangedAt = baseTime.AddHours(-8) },
            new() { Id = Guid.Parse("80000000-0000-0000-0000-000000000012"), Action = "Bulk Data Export", Event = "Bulk Data Export", EntityName = "Data", ChangedBy = "admin@ntc.gov.ph", Resource = "/data/export/employees", IpAddress = "192.168.1.105", Status = "Warning", Type = "Data", ChangedAt = baseTime.AddHours(-9) }
        };

        foreach (var log in auditLogs)
        {
            if (!await context.AuditLogs.AnyAsync(a => a.Id == log.Id))
            {
                try
                {
                    await context.AuditLogs.AddAsync(log);
                    await context.SaveChangesAsync();
                }
                catch (Exception ex) when (ex is DbUpdateException || ex.InnerException is PostgresException)
                {
                    context.Entry(log).State = EntityState.Detached;
                }
            }
        }
    }
}
