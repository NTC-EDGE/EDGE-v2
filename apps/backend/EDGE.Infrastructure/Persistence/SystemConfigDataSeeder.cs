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
            // 1. General
            new()
            {
                Category = "General",
                Key = "SYSTEM_NAME",
                Value = "NTC EDGE Portal",
                Description = "The global title displayed across headers, browser tabs, and system emails.",
                DataType = "String",
                IsPublic = true
            },
            new()
            {
                Category = "General",
                Key = "SUPPORT_EMAIL",
                Value = "support@ntc.gov.ph",
                Description = "Primary helpdesk email address shown to external applicants for inquiries.",
                DataType = "String",
                IsPublic = true
            },

            // 2. Renewal
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

            // 3. Security
            new()
            {
                Category = "Security",
                Key = "SESSION_TIMEOUT_MINS",
                Value = "30",
                Description = "Automatically logs out inactive users after the specified duration in minutes.",
                DataType = "Number",
                IsPublic = true
            },
            new()
            {
                Category = "Security",
                Key = "MAX_FAILED_LOGINS",
                Value = "5",
                Description = "Number of consecutive failed sign-in attempts before temporary account lockout.",
                DataType = "Number",
                IsPublic = true
            },

            // 4. Email / SMTP
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
                IsPublic = true
            },
            new()
            {
                Category = "Email",
                Key = "INTERNAL_PORTAL_BASE_URL",
                Value = "http://localhost:8082",
                Description = "Base URL of the Internal Officer Portal used in internal queue assignment email links.",
                DataType = "String",
                IsPublic = true
            },

            // 5. Upload
            new()
            {
                Category = "Upload",
                Key = "MAX_UPLOAD_SIZE_MB",
                Value = "25",
                Description = "Maximum file size in megabytes allowed per document attachment upload.",
                DataType = "Number",
                IsPublic = true
            },
            new()
            {
                Category = "Upload",
                Key = "ALLOWED_FILE_TYPES",
                Value = ".pdf,.jpg,.jpeg,.png,.zip",
                Description = "Comma-separated list of permitted file extensions for applicant requirement uploads.",
                DataType = "String",
                IsPublic = true
            },

            // 6. Maintenance
            new()
            {
                Category = "Maintenance",
                Key = "MAINTENANCE_MODE",
                Value = "false",
                Description = "Global Master Switch: When active, both the Client Portal and Internal Officer Portal are locked in Maintenance Mode and all user account interactions are disabled.",
                DataType = "Boolean",
                IsPublic = true
            },
            new()
            {
                Category = "Maintenance",
                Key = "CLIENT_MAINTENANCE_MODE",
                Value = "false",
                Description = "Client Portal Only: When active, locks the Client Portal and disables external applicant account interactions while allowing Internal Officers to continue working.",
                DataType = "Boolean",
                IsPublic = true
            },
            new()
            {
                Category = "Maintenance",
                Key = "INTERNAL_MAINTENANCE_MODE",
                Value = "false",
                Description = "Internal Officer Portal Only: When active, locks the Internal Officer Portal and disables staff evaluations, accounting, and cashier actions while keeping the Client Portal open.",
                DataType = "Boolean",
                IsPublic = true
            }
        };

        foreach (var def in defaultConfigs)
        {
            var existing = existingConfigs.FirstOrDefault(c => c.Key == def.Key);
            if (existing == null)
            {
                await context.SystemConfigs.AddAsync(def);
            }
            else if (def.IsPublic && !existing.IsPublic)
            {
                existing.IsPublic = true;
            }
        }

        await context.SaveChangesAsync();
    }
}
