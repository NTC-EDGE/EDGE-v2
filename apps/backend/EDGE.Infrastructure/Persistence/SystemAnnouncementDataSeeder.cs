using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using EDGE.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace EDGE.Infrastructure.Persistence;

public static class SystemAnnouncementDataSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        if (await context.SystemAnnouncements.AnyAsync())
        {
            return;
        }

        var staticDate = new DateTime(2026, 1, 15, 8, 0, 0, DateTimeKind.Utc);

        var announcements = new List<SystemAnnouncement>
        {
            new()
            {
                Id = Guid.Parse("70000000-0000-0000-0000-000000000001"),
                Title = "Scheduled System Maintenance - Regional Gateway Upgrade",
                Message = "Please be advised that the NTC EDGE Regional Application Gateways will undergo scheduled maintenance on Saturday, March 1, 2026, from 00:00 to 04:00 PHT. Online submission services will be temporarily unavailable during this window.",
                Type = "Maintenance",
                IsActive = true,
                StartDate = staticDate,
                EndDate = staticDate.AddDays(45),
                TargetAudience = "All Users (Public & Internal Staff)",
                CreatedAt = staticDate
            },
            new()
            {
                Id = Guid.Parse("70000000-0000-0000-0000-000000000002"),
                Title = "Updated Fee Schedule for Commercial Spectrum Permits",
                Message = "Pursuant to NTC Memorandum Circular No. 04-12-2025, new processing fee tiers for Commercial Radio Station Permits and Spectrum Channel Allocations are now effective across all regional field offices.",
                Type = "Info",
                IsActive = true,
                StartDate = staticDate.AddDays(-10),
                EndDate = staticDate.AddDays(90),
                TargetAudience = "Commercial License Applicants & Evaluators",
                CreatedAt = staticDate.AddDays(-10)
            },
            new()
            {
                Id = Guid.Parse("70000000-0000-0000-0000-000000000003"),
                Title = "Urgent Security Protocol Update for Single Sign-On (GovSSO)",
                Message = "All internal evaluators and regional directors must update their multi-factor authentication credentials in compliance with National Cyber Security Directorate Guidelines.",
                Type = "Warning",
                IsActive = true,
                StartDate = staticDate.AddDays(-5),
                EndDate = staticDate.AddDays(60),
                TargetAudience = "Internal Regional Staff",
                CreatedAt = staticDate.AddDays(-5)
            },
            new()
            {
                Id = Guid.Parse("70000000-0000-0000-0000-000000000004"),
                Title = "Typhoon Weather Advisory - Extension of Application Deadlines for Region VIII & X",
                Message = "Due to adverse weather conditions in Northern Mindanao and Eastern Visayas, all pending application evaluation deadlines have been extended by five (5) working days.",
                Type = "Emergency",
                IsActive = true,
                StartDate = staticDate.AddDays(-2),
                EndDate = staticDate.AddDays(14),
                TargetAudience = "Applicants & Staff in Region VIII and Region X",
                CreatedAt = staticDate.AddDays(-2)
            }
        };

        await context.SystemAnnouncements.AddRangeAsync(announcements);
        await context.SaveChangesAsync();
    }
}
