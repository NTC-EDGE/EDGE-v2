using System;
using System.Threading;
using System.Threading.Tasks;

namespace EDGE.Application.Common.Interfaces;

public interface IApplicationEmailNotificationService
{
    Task SendApplicationSubmittedAsync(Guid applicationId, CancellationToken cancellationToken = default);
    Task SendApplicationReturnedForComplianceAsync(Guid applicationId, string? remarks, CancellationToken cancellationToken = default);
    Task SendApplicationUnderAccountingReviewAsync(Guid applicationId, CancellationToken cancellationToken = default);
    Task SendApplicationReadyForPaymentAsync(Guid applicationId, Guid? orderOfPaymentId = null, CancellationToken cancellationToken = default);
    Task SendPaymentSubmittedToCashierAsync(Guid applicationId, string? paymentMethod, string? paymentReference, CancellationToken cancellationToken = default);
    Task SendPaymentConfirmedForIssuanceAsync(Guid applicationId, string? officialReceiptNumber, decimal amountPaid, CancellationToken cancellationToken = default);
    Task SendApplicationCompletedAsync(Guid applicationId, string? issuedDocumentSummary = null, CancellationToken cancellationToken = default);
}
