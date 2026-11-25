using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EDGE.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace EDGE.Infrastructure.Persistence;

public static class SystemConfigDataSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        var existingConfigs = await context.SystemConfigs.IgnoreQueryFilters().ToListAsync();

        var defaultConfigs = new List<SystemConfig>
        {
            new()
            {
                Category = "Renewal",
                Key = "Renewal:DaysBeforeExpiration",
                Value = "60,30,15,1,0",
                Description = "Comma-separated days before expiration to notify clients for renewal and enable renewal button (e.g. 60,30,15,1,0 where 0 is on the day of expiration).",
                DataType = "String",
                IsPublic = true
            },
            new()
            {
                Category = "Renewal",
                Key = "Renewal:DefaultValidityYears",
                Value = "1",
                Description = "Default statutory validity duration in years added to original expiration date upon renewal.",
                DataType = "Number",
                IsPublic = true
            },
            new()
            {
                Category = "Email",
                Key = "EMAIL_ENABLED",
                Value = "true",
                Description = "Master switch to enable or disable outbound SMTP email delivery across the portal.",
                DataType = "Boolean",
                IsPublic = false
            },
            new()
            {
                Category = "Email",
                Key = "SMTP_SERVER",
                Value = "smtp.ntc.gov.ph",
                Description = "Outbound SMTP server hostname (e.g. smtp.ntc.gov.ph or smtp.gmail.com).",
                DataType = "String",
                IsPublic = false
            },
            new()
            {
                Category = "Email",
                Key = "SMTP_PORT",
                Value = "587",
                Description = "Outbound SMTP server port (typically 587 for STARTTLS or 465 for SSL).",
                DataType = "Number",
                IsPublic = false
            },
            new()
            {
                Category = "Email",
                Key = "SMTP_USE_SSL",
                Value = "true",
                Description = "Enable SSL/TLS encryption for SMTP connections.",
                DataType = "Boolean",
                IsPublic = false
            },
            new()
            {
                Category = "Email",
                Key = "SMTP_USERNAME",
                Value = "",
                Description = "SMTP authentication username or account email address.",
                DataType = "String",
                IsPublic = false
            },
            new()
            {
                Category = "Email",
                Key = "SMTP_PASSWORD",
                Value = "",
                Description = "SMTP authentication password or App Password.",
                DataType = "String",
                IsPublic = false
            },
            new()
            {
                Category = "Email",
                Key = "SMTP_FROM_EMAIL",
                Value = "no-reply@ntc.gov.ph",
                Description = "Default sender From email address for automated notifications.",
                DataType = "String",
                IsPublic = false
            },
            new()
            {
                Category = "Email",
                Key = "SMTP_FROM_NAME",
                Value = "NTC EDGE Portal",
                Description = "Default sender display name for automated notifications.",
                DataType = "String",
                IsPublic = false
            },
            new()
            {
                Category = "Email",
                Key = "CLIENT_PORTAL_BASE_URL",
                Value = "http://localhost:8081",
                Description = "Base URL of the Client Portal used in email notification links.",
                DataType = "String",
                IsPublic = false
            },
            new()
            {
                Category = "Email",
                Key = "INTERNAL_PORTAL_BASE_URL",
                Value = "http://localhost:8082",
                Description = "Base URL of the Internal Officer Portal used in internal queue assignment email links.",
                DataType = "String",
                IsPublic = false
            }
        };

        foreach (var def in defaultConfigs)
        {
            if (!existingConfigs.Any(c => c.Key == def.Key))
            {
                await context.SystemConfigs.AddAsync(def);
            }
        }

        await context.SaveChangesAsync();
    }
}
