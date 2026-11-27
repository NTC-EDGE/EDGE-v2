using System;
using System.Linq.Expressions;
using System.Threading;
using System.Threading.Tasks;
using Hangfire;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Infrastructure.Services;

/// <summary>
/// Non-blocking decorator over <see cref="ApplicationEmailNotificationService"/> that enqueues
/// workflow email/notification delivery onto Hangfire (with an in-process scoped fallback) so
/// HTTP requests like application submission, evaluation, payment verification, and issuance
/// never time out waiting on sequential SMTP handshakes.
/// </summary>
public sealed class QueuedApplicationEmailNotificationService : IApplicationEmailNotificationService
{
    private readonly IBackgroundJobClient? _backgroundJobClient;
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<QueuedApplicationEmailNotificationService> _logger;

    public QueuedApplicationEmailNotificationService(
        IServiceScopeFactory scopeFactory,
        ILogger<QueuedApplicationEmailNotificationService> logger,
        IBackgroundJobClient? backgroundJobClient = null)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
        _backgroundJobClient = backgroundJobClient;
    }

    public Task SendApplicationSubmittedAsync(Guid applicationId, CancellationToken cancellationToken = default)
    {
        return DispatchAsync(
            nameof(SendApplicationSubmittedAsync),
            svc => svc.SendApplicationSubmittedAsync(applicationId, CancellationToken.None),
            svc => svc.SendApplicationSubmittedAsync(applicationId, CancellationToken.None));
    }

    public Task SendApplicationReturnedForComplianceAsync(Guid applicationId, string? remarks, CancellationToken cancellationToken = default)
    {
        return DispatchAsync(
            nameof(SendApplicationReturnedForComplianceAsync),
            svc => svc.SendApplicationReturnedForComplianceAsync(applicationId, remarks, CancellationToken.None),
            svc => svc.SendApplicationReturnedForComplianceAsync(applicationId, remarks, CancellationToken.None));
    }

    public Task SendApplicationUnderAccountingReviewAsync(Guid applicationId, CancellationToken cancellationToken = default)
    {
        return DispatchAsync(
            nameof(SendApplicationUnderAccountingReviewAsync),
            svc => svc.SendApplicationUnderAccountingReviewAsync(applicationId, CancellationToken.None),
            svc => svc.SendApplicationUnderAccountingReviewAsync(applicationId, CancellationToken.None));
    }

    public Task SendApplicationReadyForPaymentAsync(Guid applicationId, Guid? orderOfPaymentId = null, CancellationToken cancellationToken = default)
    {
        return DispatchAsync(
            nameof(SendApplicationReadyForPaymentAsync),
            svc => svc.SendApplicationReadyForPaymentAsync(applicationId, orderOfPaymentId, CancellationToken.None),
            svc => svc.SendApplicationReadyForPaymentAsync(applicationId, orderOfPaymentId, CancellationToken.None));
    }

    public Task SendPaymentSubmittedToCashierAsync(Guid applicationId, string? paymentMethod, string? paymentReference, CancellationToken cancellationToken = default)
    {
        return DispatchAsync(
            nameof(SendPaymentSubmittedToCashierAsync),
            svc => svc.SendPaymentSubmittedToCashierAsync(applicationId, paymentMethod, paymentReference, CancellationToken.None),
            svc => svc.SendPaymentSubmittedToCashierAsync(applicationId, paymentMethod, paymentReference, CancellationToken.None));
    }

    public Task SendPaymentConfirmedForIssuanceAsync(Guid applicationId, string? officialReceiptNumber, decimal amountPaid, CancellationToken cancellationToken = default)
    {
        return DispatchAsync(
            nameof(SendPaymentConfirmedForIssuanceAsync),
            svc => svc.SendPaymentConfirmedForIssuanceAsync(applicationId, officialReceiptNumber, amountPaid, CancellationToken.None),
            svc => svc.SendPaymentConfirmedForIssuanceAsync(applicationId, officialReceiptNumber, amountPaid, CancellationToken.None));
    }

    public Task SendApplicationCompletedAsync(Guid applicationId, string? issuedDocumentSummary = null, CancellationToken cancellationToken = default)
    {
        return DispatchAsync(
            nameof(SendApplicationCompletedAsync),
            svc => svc.SendApplicationCompletedAsync(applicationId, issuedDocumentSummary, CancellationToken.None),
            svc => svc.SendApplicationCompletedAsync(applicationId, issuedDocumentSummary, CancellationToken.None));
    }

    private Task DispatchAsync(
        string jobName,
        Expression<Func<ApplicationEmailNotificationService, Task>> hangfireJob,
        Func<ApplicationEmailNotificationService, Task> fallbackAction)
    {
        if (_backgroundJobClient != null)
        {
            try
            {
                _backgroundJobClient.Enqueue(hangfireJob);
                return Task.CompletedTask;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(
                    ex,
                    "Hangfire enqueue failed for {JobName}; falling back to background task execution.",
                    jobName);
            }
        }

        _ = Task.Run(async () =>
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var inner = scope.ServiceProvider.GetRequiredService<ApplicationEmailNotificationService>();
                await fallbackAction(inner);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Background notification dispatch failed for {JobName}.", jobName);
            }
        });

        return Task.CompletedTask;
    }
}
