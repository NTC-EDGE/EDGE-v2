using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;
using EDGE.Infrastructure.Hubs;
using EDGE.Infrastructure.Persistence;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace EDGE.Infrastructure.Jobs;

public class ProcessExpiringApplicationsJob
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<ProcessExpiringApplicationsJob> _logger;
    private readonly IHubContext<NotificationHub> _hubContext;

    public ProcessExpiringApplicationsJob(
        ApplicationDbContext context,
        ILogger<ProcessExpiringApplicationsJob> logger,
        IHubContext<NotificationHub> hubContext)
    {
        _context = context;
        _logger = logger;
        _hubContext = hubContext;
    }

    public async Task ExecuteAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Starting ProcessExpiringApplicationsJob execution at {Time}...", DateTimeOffset.UtcNow);

        // 1. Retrieve configured daysBeforeExpiration from system config
        var config = await _context.SystemConfigs
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Key == "Renewal:DaysBeforeExpiration", cancellationToken);

        var rawThresholds = config?.Value ?? "60,30,15,1,0";
        var thresholds = rawThresholds
            .Split(new[] { ',', ';' }, StringSplitOptions.RemoveEmptyEntries)
            .Select(s => int.TryParse(s.Trim(), out var val) ? val : (int?)null)
            .Where(v => v.HasValue)
            .Select(v => v!.Value)
            .OrderByDescending(v => v)
            .ToList();

        if (thresholds.Count == 0)
        {
            thresholds = new List<int> { 60, 30, 15, 1, 0 };
        }

        var today = DateTime.UtcNow.Date;

        // 2. Query Completed applications with IssuedDocumentDetails that have an ExpiryDate
        var eligibleApps = await _context.Applications
            .Include(a => a.IssuedDocumentDetails)
            .Include(a => a.Renewals)
            .Where(a => a.Status == ApplicationStatus.Completed && a.IssuedDocumentDetails.Any(d => d.ExpiryDate != null))
            .ToListAsync(cancellationToken);

        _logger.LogInformation("Found {Count} completed applications with issued documents.", eligibleApps.Count);

        var notificationsToCreate = new List<UserNotification>();

        foreach (var app in eligibleApps)
        {
            // Must have a valid target user to receive notification
            if (!app.UserId.HasValue)
            {
                continue;
            }

            // If there is already an active renewal in progress, skip reminder
            var hasActiveRenewal = app.Renewals.Any(r =>
                r.Status != ApplicationStatus.Draft &&
                r.Status != ApplicationStatus.Returned);

            if (hasActiveRenewal)
            {
                continue;
            }

            var latestDoc = app.IssuedDocumentDetails
                .Where(d => d.ExpiryDate != null)
                .OrderByDescending(d => d.ExpiryDate)
                .FirstOrDefault();

            if (latestDoc?.ExpiryDate == null)
            {
                continue;
            }

            var expiryDate = latestDoc.ExpiryDate.Value.Date;
            var daysRemaining = (int)(expiryDate - today).TotalDays;

            // Check milestone thresholds prior to expiration (e.g. 60, 30, 15, 1 days before)
            foreach (var threshold in thresholds.Where(t => t > 0))
            {
                if (daysRemaining <= threshold && daysRemaining > 0)
                {
                    var referenceId = $"RENEWAL_ALERT:{latestDoc.Id}:{threshold}";
                    var alreadySent = await _context.UserNotifications
                        .AnyAsync(n => n.ReferenceId == referenceId, cancellationToken);

                    if (!alreadySent && !notificationsToCreate.Any(n => n.ReferenceId == referenceId))
                    {
                        var docTitle = string.IsNullOrWhiteSpace(latestDoc.LicenseNumber)
                            ? (latestDoc.DocumentType ?? "Document")
                            : $"{latestDoc.DocumentType} #{latestDoc.LicenseNumber}";

                        notificationsToCreate.Add(new UserNotification
                        {
                            UserId = app.UserId.Value,
                            TenantId = app.TenantId,
                            Type = NotificationType.ApplicationRenewalReminder,
                            Title = $"Permit/License Renewal Reminder ({daysRemaining} days remaining)",
                            Body = $"Your {docTitle} for application #{app.ReferenceNumber} is expiring on {expiryDate:MMMM dd, yyyy} ({daysRemaining} day(s) remaining). Please file your renewal application promptly.",
                            ActionUrl = $"/my-applications?action=renew&applicationId={app.Id}",
                            ReferenceId = referenceId,
                            IsRead = false
                        });
                    }
                }
            }

            // On-day expiry & expired alert (daysRemaining <= 0)
            if (daysRemaining <= 0)
            {
                var expiredRefId = $"RENEWAL_ALERT:{latestDoc.Id}:EXPIRED";
                var alreadySent = await _context.UserNotifications
                    .AnyAsync(n => n.ReferenceId == expiredRefId, cancellationToken);

                if (!alreadySent && !notificationsToCreate.Any(n => n.ReferenceId == expiredRefId))
                {
                    var docTitle = string.IsNullOrWhiteSpace(latestDoc.LicenseNumber)
                        ? (latestDoc.DocumentType ?? "Document")
                        : $"{latestDoc.DocumentType} #{latestDoc.LicenseNumber}";

                    var isOnDay = daysRemaining == 0;
                    var title = isOnDay
                        ? $"Notice: Application Expired Today ({docTitle})"
                        : $"Notice: Application Expired ({docTitle})";

                    var body = isOnDay
                        ? $"Your application #{app.ReferenceNumber} ({docTitle}) has been expired on {expiryDate:MMMM dd, yyyy}. Please submit your renewal application immediately."
                        : $"Your application #{app.ReferenceNumber} ({docTitle}) has been expired on {expiryDate:MMMM dd, yyyy}. A renewal application is required.";

                    notificationsToCreate.Add(new UserNotification
                    {
                        UserId = app.UserId.Value,
                        TenantId = app.TenantId,
                        Type = NotificationType.ApplicationRenewalReminder,
                        Title = title,
                        Body = body,
                        ActionUrl = $"/my-applications?action=renew&applicationId={app.Id}",
                        ReferenceId = expiredRefId,
                        IsRead = false
                    });
                }
            }
        }

        if (notificationsToCreate.Count > 0)
        {
            await _context.UserNotifications.AddRangeAsync(notificationsToCreate, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);
            _logger.LogInformation("Dispatched {Count} renewal reminder notifications.", notificationsToCreate.Count);

            try
            {
                await _hubContext.Clients.All.SendAsync("ReceiveNotification", "ApplicationRenewalReminder", cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to broadcast SignalR notification.");
            }
        }
    }
}
