using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using EDGE.Application.Common.Interfaces;
using EDGE.Domain.Constants;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;
using EDGE.Infrastructure.Hubs;
using EDGE.Infrastructure.Options;

namespace EDGE.Infrastructure.Services;

public class ApplicationEmailNotificationService : IApplicationEmailNotificationService
{
    private readonly IApplicationFullRepository _applicationRepository;
    private readonly INotificationTemplateRepository _templateRepository;
    private readonly IRegionalConfigurationService _regionalConfigService;
    private readonly ITenantMemberRepository _tenantMemberRepository;
    private readonly IUserRepository _userRepository;
    private readonly IUserNotificationRepository _userNotificationRepository;
    private readonly IEmailService _emailService;
    private readonly EmailOptions _emailOptions;
    private readonly ISystemConfigRepository? _systemConfigRepository;
    private readonly IHubContext<NotificationHub>? _hubContext;
    private readonly ILogger<ApplicationEmailNotificationService> _logger;

    public ApplicationEmailNotificationService(
        IApplicationFullRepository applicationRepository,
        INotificationTemplateRepository templateRepository,
        IRegionalConfigurationService regionalConfigService,
        ITenantMemberRepository tenantMemberRepository,
        IUserRepository userRepository,
        IUserNotificationRepository userNotificationRepository,
        IEmailService emailService,
        IOptions<EmailOptions> emailOptions,
        ILogger<ApplicationEmailNotificationService> logger,
        IHubContext<NotificationHub>? hubContext = null,
        ISystemConfigRepository? systemConfigRepository = null)
    {
        _applicationRepository = applicationRepository;
        _templateRepository = templateRepository;
        _regionalConfigService = regionalConfigService;
        _tenantMemberRepository = tenantMemberRepository;
        _userRepository = userRepository;
        _userNotificationRepository = userNotificationRepository;
        _emailService = emailService;
        _emailOptions = emailOptions.Value;
        _logger = logger;
        _hubContext = hubContext;
        _systemConfigRepository = systemConfigRepository;
    }

    public async Task SendApplicationSubmittedAsync(Guid applicationId, CancellationToken cancellationToken = default)
    {
        try
        {
            var app = await _applicationRepository.GetByIdWithDetailsAsync(applicationId, cancellationToken);
            if (app == null) return;

            var context = await ResolveApplicationContextAsync(app, cancellationToken);

            // 1. EXTERNAL CLIENT EMAIL (Always Sent)
            if (!string.IsNullOrWhiteSpace(context.ClientEmail))
            {
                var placeholders = BuildBasePlaceholders(app, context);
                await DispatchTemplateEmailAsync(
                    "External_ApplicationSubmitted",
                    context.ClientEmail,
                    context.ApplicantName,
                    placeholders,
                    fallbackSubject: $"Application Received – {context.ServiceName} ({context.ReferenceNumber})",
                    fallbackHtml: $"<p>Hello {context.ApplicantName},</p><p>Your application <strong>{context.ReferenceNumber}</strong> for <strong>{context.ServiceName}</strong> has been received and queued for evaluation. No payment is required at this stage.</p>",
                    cancellationToken);
            }

            await CreateInAppNotificationAsync(
                app.UserId,
                app.TenantId,
                $"Application Submitted ({context.ReferenceNumber})",
                $"Your application for {context.ServiceName} has been submitted and queued for evaluation. No payment is required yet.",
                $"/my-applications?applicationId={app.Id}",
                $"APP_SUBMITTED:{app.Id}",
                cancellationToken);

            // 2. INTERNAL OFFICER EMAIL (Gated by Regional Admin Prerogative & DirectToLegal Complaint Routing)
            var regionalConfig = await _regionalConfigService.GetConfigurationAsync(app.TenantId, cancellationToken);
            if (regionalConfig.EnableInternalEmailNotifications)
            {
                bool routeDirectToLegal = context.IsRequestOrComplaint &&
                    string.Equals(regionalConfig.RequestAndComplaintRouting, "DirectToLegal", StringComparison.OrdinalIgnoreCase);

                var targetOfficers = await ResolveTenantOfficersByRoleAsync(
                    app.TenantId,
                    routeDirectToLegal ? "legal" : "evaluator",
                    cancellationToken);

                foreach (var officer in targetOfficers)
                {
                    var internalPlaceholders = BuildBasePlaceholders(app, context);
                    internalPlaceholders["Evaluator Name"] = officer.Name;
                    internalPlaceholders["EvaluatorName"] = officer.Name;
                    internalPlaceholders["Application Link"] = $"{context.InternalPortalBaseUrl.TrimEnd('/')}/queue?applicationId={app.Id}";
                    internalPlaceholders["ApplicationLink"] = $"{context.InternalPortalBaseUrl.TrimEnd('/')}/queue?applicationId={app.Id}";

                    await DispatchTemplateEmailAsync(
                        "Internal_ApplicationSubmitted",
                        officer.Email,
                        officer.Name,
                        internalPlaceholders,
                        fallbackSubject: routeDirectToLegal
                            ? $"New Request/Complaint Assigned to Legal – {context.ReferenceNumber}"
                            : $"New Application for Evaluation – {context.ReferenceNumber}",
                        fallbackHtml: $"<p>Hello {officer.Name},</p><p>A new application <strong>{context.ReferenceNumber}</strong> ({context.ServiceName}) from <strong>{context.ApplicantName}</strong> has been assigned to your {(routeDirectToLegal ? "Legal Review" : "Evaluation")} queue.</p>",
                        cancellationToken);
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Non-fatal error sending ApplicationSubmitted email notification for ApplicationId '{ApplicationId}'.", applicationId);
        }
    }

    public async Task SendApplicationReturnedForComplianceAsync(Guid applicationId, string? remarks, CancellationToken cancellationToken = default)
    {
        try
        {
            var app = await _applicationRepository.GetByIdWithDetailsAsync(applicationId, cancellationToken);
            if (app == null) return;

            var context = await ResolveApplicationContextAsync(app, cancellationToken);
            var effectiveRemarks = !string.IsNullOrWhiteSpace(remarks)
                ? remarks.Trim()
                : (!string.IsNullOrWhiteSpace(app.Remarks) ? app.Remarks.Trim() : "Please review your application details and supporting documents for required corrections.");

            if (!string.IsNullOrWhiteSpace(context.ClientEmail))
            {
                var placeholders = BuildBasePlaceholders(app, context);
                placeholders["Reasons / Remarks"] = effectiveRemarks;
                placeholders["Reasons"] = effectiveRemarks;
                placeholders["Remarks"] = effectiveRemarks;

                await DispatchTemplateEmailAsync(
                    "External_ApplicationReturnedForCompliance",
                    context.ClientEmail,
                    context.ApplicantName,
                    placeholders,
                    fallbackSubject: $"Action Required: Compliance Requested – {context.ServiceName} ({context.ReferenceNumber})",
                    fallbackHtml: $"<p>Hello {context.ApplicantName},</p><p>Your application <strong>{context.ReferenceNumber}</strong> requires compliance updates:</p><pre>{effectiveRemarks}</pre><p>Next Step: Open your application in the NTC EDGE Client Portal and click <strong>Edit Application</strong> to update your details or replace attachments.</p>",
                    cancellationToken);
            }

            await CreateInAppNotificationAsync(
                app.UserId,
                app.TenantId,
                $"Action Required: Application Returned ({context.ReferenceNumber})",
                $"Your application for {context.ServiceName} was returned for compliance: {effectiveRemarks}",
                $"/my-applications?applicationId={app.Id}",
                $"APP_RETURNED:{app.Id}:{DateTime.UtcNow:yyyyMMddHHmm}",
                cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Non-fatal error sending ApplicationReturnedForCompliance email notification for ApplicationId '{ApplicationId}'.", applicationId);
        }
    }

    public async Task SendApplicationUnderAccountingReviewAsync(Guid applicationId, CancellationToken cancellationToken = default)
    {
        try
        {
            var app = await _applicationRepository.GetByIdWithDetailsAsync(applicationId, cancellationToken);
            if (app == null) return;

            var context = await ResolveApplicationContextAsync(app, cancellationToken);
            var isAssessmentOnly = app.Intent == ApplicationIntent.AssessmentOnly;

            // 1. EXTERNAL CLIENT EMAIL (Always Sent)
            if (!string.IsNullOrWhiteSpace(context.ClientEmail))
            {
                var placeholders = BuildBasePlaceholders(app, context);
                placeholders["Next Step Notice"] = isAssessmentOnly
                    ? "Your Pre-Assessment Statement of Account (SOA) has been approved and is ready to view in your portal. You may now convert this Pre-Assessment into an Official Application to proceed with payment."
                    : "Your application has passed technical evaluation and is now with the Regional Accountant for Statement of Account (SOA) and Order of Payment (OP) generation. No payment is required yet—you will receive another email as soon as your Order of Payment is ready.";

                await DispatchTemplateEmailAsync(
                    "External_ApplicationUnderAccountingReview",
                    context.ClientEmail,
                    context.ApplicantName,
                    placeholders,
                    fallbackSubject: isAssessmentOnly
                        ? $"Pre-Assessment Completed – Statement of Account Ready ({context.ReferenceNumber})"
                        : $"Technical Evaluation Approved – Fee Assessment in Progress ({context.ReferenceNumber})",
                    fallbackHtml: $"<p>Hello {context.ApplicantName},</p><p>{placeholders["Next Step Notice"]}</p>",
                    cancellationToken);
            }

            await CreateInAppNotificationAsync(
                app.UserId,
                app.TenantId,
                isAssessmentOnly
                    ? $"Pre-Assessment Completed ({context.ReferenceNumber})"
                    : $"Technical Evaluation Approved ({context.ReferenceNumber})",
                isAssessmentOnly
                    ? $"Your Pre-Assessment Statement of Account for {context.ServiceName} is now available."
                    : $"Your application for {context.ServiceName} passed technical evaluation and is with Accounting for Order of Payment generation. Do not pay yet.",
                $"/my-applications?applicationId={app.Id}",
                $"APP_ACCOUNTING:{app.Id}",
                cancellationToken);

            // 2. INTERNAL OFFICER EMAIL TO ACCOUNTANTS (Gated by Regional Admin Prerogative)
            if (!isAssessmentOnly)
            {
                var regionalConfig = await _regionalConfigService.GetConfigurationAsync(app.TenantId, cancellationToken);
                if (regionalConfig.EnableInternalEmailNotifications)
                {
                    var accountants = await ResolveTenantOfficersByRoleAsync(app.TenantId, "accountant", cancellationToken);
                    foreach (var accountant in accountants)
                    {
                        var internalPlaceholders = BuildBasePlaceholders(app, context);
                        internalPlaceholders["Accountant Name"] = accountant.Name;
                        internalPlaceholders["AccountantName"] = accountant.Name;
                        internalPlaceholders["Approving Personnel Name"] = context.LastStaffName;
                        internalPlaceholders["Approval Date"] = DateTime.UtcNow.ToString("MMMM dd, yyyy", CultureInfo.InvariantCulture);
                        internalPlaceholders["Application Link"] = $"{context.InternalPortalBaseUrl.TrimEnd('/')}/queue?applicationId={app.Id}";

                        await DispatchTemplateEmailAsync(
                            "Internal_ApplicationApproved",
                            accountant.Email,
                            accountant.Name,
                            internalPlaceholders,
                            fallbackSubject: $"Action Required: Generate SOA & OP – {context.ReferenceNumber}",
                            fallbackHtml: $"<p>Hello {accountant.Name},</p><p>Application <strong>{context.ReferenceNumber}</strong> ({context.ServiceName}) for <strong>{context.ApplicantName}</strong> has been approved by the Evaluator and is ready for SOA/OP approval.</p>",
                            cancellationToken);
                    }
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Non-fatal error sending ApplicationUnderAccountingReview email notification for ApplicationId '{ApplicationId}'.", applicationId);
        }
    }

    public async Task SendApplicationReadyForPaymentAsync(Guid applicationId, Guid? orderOfPaymentId = null, CancellationToken cancellationToken = default)
    {
        try
        {
            var app = await _applicationRepository.GetByIdWithDetailsAsync(applicationId, cancellationToken);
            if (app == null) return;

            var context = await ResolveApplicationContextAsync(app, cancellationToken);

            // 1. EXTERNAL CLIENT EMAIL (Always Sent — notifies client that payment is now required)
            if (!string.IsNullOrWhiteSpace(context.ClientEmail))
            {
                var placeholders = BuildBasePlaceholders(app, context);
                await DispatchTemplateEmailAsync(
                    "External_ApplicationApprovedReadyForPayment",
                    context.ClientEmail,
                    context.ApplicantName,
                    placeholders,
                    fallbackSubject: $"Approved & Ready for Payment – {context.ServiceName} ({context.ReferenceNumber})",
                    fallbackHtml: $"<p>Congratulations {context.ApplicantName}!</p><p>Your Order of Payment for <strong>{context.ServiceName}</strong> ({context.ReferenceNumber}) has been issued. Total Amount Due: <strong>₱{context.TotalAmountFormatted}</strong>. Please log in to the NTC EDGE Portal to submit your payment details.</p>",
                    cancellationToken);
            }

            await CreateInAppNotificationAsync(
                app.UserId,
                app.TenantId,
                $"Order of Payment Ready – Payment Required ({context.ReferenceNumber})",
                $"Your application for {context.ServiceName} is approved for payment (Total Due: ₱{context.TotalAmountFormatted}). Please proceed to payment.",
                $"/my-applications?applicationId={app.Id}",
                $"APP_READY_FOR_PAYMENT:{app.Id}",
                cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Non-fatal error sending ApplicationReadyForPayment email notification for ApplicationId '{ApplicationId}'.", applicationId);
        }
    }

    public async Task SendPaymentSubmittedToCashierAsync(Guid applicationId, string? paymentMethod, string? paymentReference, CancellationToken cancellationToken = default)
    {
        try
        {
            var app = await _applicationRepository.GetByIdWithDetailsAsync(applicationId, cancellationToken);
            if (app == null) return;

            var regionalConfig = await _regionalConfigService.GetConfigurationAsync(app.TenantId, cancellationToken);
            if (!regionalConfig.EnableInternalEmailNotifications)
            {
                return;
            }

            var context = await ResolveApplicationContextAsync(app, cancellationToken);
            var cashiers = await ResolveTenantOfficersByRoleAsync(app.TenantId, "cashier", cancellationToken);

            foreach (var cashier in cashiers)
            {
                var internalPlaceholders = BuildBasePlaceholders(app, context);
                internalPlaceholders["Cashier Name"] = cashier.Name;
                internalPlaceholders["CashierName"] = cashier.Name;
                internalPlaceholders["Payment Method"] = !string.IsNullOrWhiteSpace(paymentMethod) ? paymentMethod : "Portal Payment";
                internalPlaceholders["Payment Submission Date"] = DateTime.UtcNow.ToString("MMMM dd, yyyy", CultureInfo.InvariantCulture);
                internalPlaceholders["Application Link"] = $"{context.InternalPortalBaseUrl.TrimEnd('/')}/queue?applicationId={app.Id}";

                await DispatchTemplateEmailAsync(
                    "Internal_ApplicationProceededToPayment",
                    cashier.Email,
                    cashier.Name,
                    internalPlaceholders,
                    fallbackSubject: $"Payment Verification Queue – {context.ReferenceNumber}",
                    fallbackHtml: $"<p>Hello {cashier.Name},</p><p>Applicant <strong>{context.ApplicantName}</strong> submitted payment via <strong>{internalPlaceholders["Payment Method"]}</strong> (Ref: {paymentReference ?? "N/A"}) for application <strong>{context.ReferenceNumber}</strong>. Please verify payment and issue the Official Receipt (OR).</p>",
                    cancellationToken);
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Non-fatal error sending PaymentSubmittedToCashier email notification for ApplicationId '{ApplicationId}'.", applicationId);
        }
    }

    public async Task SendPaymentConfirmedForIssuanceAsync(Guid applicationId, string? officialReceiptNumber, decimal amountPaid, CancellationToken cancellationToken = default)
    {
        try
        {
            var app = await _applicationRepository.GetByIdWithDetailsAsync(applicationId, cancellationToken);
            if (app == null) return;

            var context = await ResolveApplicationContextAsync(app, cancellationToken);
            var orNumber = !string.IsNullOrWhiteSpace(officialReceiptNumber) ? officialReceiptNumber.Trim() : "Issued";
            var amountFormatted = amountPaid > 0
                ? amountPaid.ToString("N2", CultureInfo.InvariantCulture)
                : context.TotalAmountFormatted;

            if (!string.IsNullOrWhiteSpace(context.ClientEmail))
            {
                var placeholders = BuildBasePlaceholders(app, context);
                placeholders["OR Number"] = orNumber;
                placeholders["Official Receipt Number"] = orNumber;
                placeholders["Amount Paid"] = amountFormatted;
                placeholders["Total"] = amountFormatted;

                await DispatchTemplateEmailAsync(
                    "External_PaymentConfirmedForIssuance",
                    context.ClientEmail,
                    context.ApplicantName,
                    placeholders,
                    fallbackSubject: $"Payment Confirmed (OR #{orNumber}) – Processing Official Document ({context.ReferenceNumber})",
                    fallbackHtml: $"<p>Hello {context.ApplicantName},</p><p>Your payment of <strong>₱{amountFormatted}</strong> for application <strong>{context.ReferenceNumber}</strong> ({context.ServiceName}) has been verified under Official Receipt <strong>#{orNumber}</strong>. No further payment is required. Your official document is now being finalized for release.</p>",
                    cancellationToken);
            }

            await CreateInAppNotificationAsync(
                app.UserId,
                app.TenantId,
                $"Payment Verified – OR #{orNumber} ({context.ReferenceNumber})",
                $"Your payment of ₱{amountFormatted} has been verified. Your application is now in the Document & License Issuance stage.",
                $"/my-applications?applicationId={app.Id}",
                $"APP_PAYMENT_CONFIRMED:{app.Id}:{orNumber}",
                cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Non-fatal error sending PaymentConfirmedForIssuance email notification for ApplicationId '{ApplicationId}'.", applicationId);
        }
    }

    public async Task SendApplicationCompletedAsync(Guid applicationId, string? issuedDocumentSummary = null, CancellationToken cancellationToken = default)
    {
        try
        {
            var app = await _applicationRepository.GetByIdWithDetailsAsync(applicationId, cancellationToken);
            if (app == null) return;

            var context = await ResolveApplicationContextAsync(app, cancellationToken);
            var latestDoc = app.IssuedDocumentDetails?.OrderByDescending(d => d.CreatedAt).FirstOrDefault();
            var docLabel = !string.IsNullOrWhiteSpace(issuedDocumentSummary)
                ? issuedDocumentSummary.Trim()
                : (latestDoc != null
                    ? $"{latestDoc.DocumentType} #{latestDoc.LicenseNumber ?? latestDoc.FormNumber}"
                    : $"{context.ServiceName} Official Document");

            if (!string.IsNullOrWhiteSpace(context.ClientEmail))
            {
                var placeholders = BuildBasePlaceholders(app, context);
                placeholders["License / Permit / Certificate"] = docLabel;
                placeholders["Issued Document"] = docLabel;

                await DispatchTemplateEmailAsync(
                    "External_ApplicationComplete",
                    context.ClientEmail,
                    context.ApplicantName,
                    placeholders,
                    fallbackSubject: $"Application Completed – Official Documents Ready ({context.ReferenceNumber})",
                    fallbackHtml: $"<p>Congratulations {context.ApplicantName}!</p><p>Your application <strong>{context.ReferenceNumber}</strong> for <strong>{context.ServiceName}</strong> is complete. Your official document (<strong>{docLabel}</strong>) and Official Receipt are now ready for download in the NTC EDGE Portal.</p>",
                    cancellationToken);
            }

            await CreateInAppNotificationAsync(
                app.UserId,
                app.TenantId,
                $"Application Completed – Documents Ready ({context.ReferenceNumber})",
                $"Your official {docLabel} for {context.ServiceName} has been issued and is ready for download.",
                $"/my-applications?applicationId={app.Id}",
                $"APP_COMPLETED:{app.Id}",
                cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Non-fatal error sending ApplicationCompleted email notification for ApplicationId '{ApplicationId}'.", applicationId);
        }
    }

    private async Task DispatchTemplateEmailAsync(
        string eventKey,
        string toEmail,
        string toName,
        Dictionary<string, string> placeholders,
        string fallbackSubject,
        string fallbackHtml,
        CancellationToken cancellationToken)
    {
        var template = await _templateRepository.GetByEventKeyAsync(eventKey, cancellationToken);
        if (template != null && !template.IsActive)
        {
            _logger.LogInformation("Notification template '{EventKey}' is marked inactive in NotificationTemplates. Skipping email to '{ToEmail}'.", eventKey, toEmail);
            return;
        }

        var rawSubject = !string.IsNullOrWhiteSpace(template?.Subject) ? template!.Subject : fallbackSubject;
        var rawBody = !string.IsNullOrWhiteSpace(template?.BodyHtml) ? template!.BodyHtml : fallbackHtml;

        var renderedSubject = RenderPlaceholders(rawSubject, placeholders);
        var renderedBody = RenderPlaceholders(rawBody, placeholders);

        await _emailService.SendEmailAsync(toEmail, toName, renderedSubject, renderedBody, cancellationToken);
    }

    public static string RenderPlaceholders(string templateText, Dictionary<string, string> placeholders)
    {
        if (string.IsNullOrEmpty(templateText) || placeholders.Count == 0)
        {
            return templateText;
        }

        var result = templateText;
        foreach (var kvp in placeholders)
        {
            var key = Regex.Escape(kvp.Key);
            var val = kvp.Value ?? string.Empty;

            // Replace both {{Key}} and {Key} case-insensitively
            result = Regex.Replace(result, @"\{\{\s*" + key + @"\s*\}\}", val, RegexOptions.IgnoreCase);
            result = Regex.Replace(result, @"\{\s*" + key + @"\s*\}", val, RegexOptions.IgnoreCase);
        }

        return result;
    }

    private Dictionary<string, string> BuildBasePlaceholders(Domain.Entities.Application app, ResolvedApplicationContext ctx)
    {
        var clientLink = $"{ctx.ClientPortalBaseUrl.TrimEnd('/')}/my-applications?applicationId={app.Id}";
        var submissionDate = app.CreatedAt.ToString("MMMM dd, yyyy", CultureInfo.InvariantCulture);

        return new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            ["Applicant Name"] = ctx.ApplicantName,
            ["ApplicantName"] = ctx.ApplicantName,
            ["User Name"] = ctx.ApplicantName,
            ["UserName"] = ctx.ApplicantName,
            ["Reference Number"] = ctx.ReferenceNumber,
            ["ReferenceNumber"] = ctx.ReferenceNumber,
            ["ApplicationNumber"] = app.ApplicationNumber ?? ctx.ReferenceNumber,
            ["Service Name"] = ctx.ServiceName,
            ["ServiceName"] = ctx.ServiceName,
            ["Service Variant"] = ctx.ServiceVariantName,
            ["ServiceVariant"] = ctx.ServiceVariantName,
            ["Submission Date"] = submissionDate,
            ["SubmissionDate"] = submissionDate,
            ["Exam Date"] = ctx.ExamDateFormatted,
            ["Fee 1"] = ctx.Fee1Name,
            ["Fee 2"] = ctx.Fee2Name,
            ["Amount"] = ctx.Fee1AmountFormatted,
            ["Total"] = ctx.TotalAmountFormatted,
            ["OR Number"] = ctx.OrNumber,
            ["License / Permit / Certificate"] = ctx.IssuedDocSummary,
            ["Reasons / Remarks"] = app.Remarks ?? "Please check the portal for details.",
            ["Application Link"] = clientLink,
            ["ApplicationLink"] = clientLink,
            ["System Name"] = ctx.SystemName,
            ["SystemName"] = ctx.SystemName,
            ["Support Email"] = ctx.SupportEmail,
            ["SupportEmail"] = ctx.SupportEmail
        };
    }

    private async Task<ResolvedApplicationContext> ResolveApplicationContextAsync(
        Domain.Entities.Application app,
        CancellationToken cancellationToken)
    {
        var primaryApplicant = app.ApplicationApplicants?
            .OrderBy(aa => aa.SequenceOrder)
            .Select(aa => aa.Applicant)
            .FirstOrDefault(a => a != null);

        var detail = primaryApplicant?.ApplicantDetail;
        var company = primaryApplicant?.CompanyDetail ?? detail?.CompanyDetail;
        var service = primaryApplicant?.Service;
        var variant = primaryApplicant?.ServiceVariant;

        string? clientEmail = detail?.EmailAddress;
        if (string.IsNullOrWhiteSpace(clientEmail))
        {
            clientEmail = company?.Email;
        }
        if (string.IsNullOrWhiteSpace(clientEmail) && app.User != null)
        {
            clientEmail = app.User.Email;
        }
        if (string.IsNullOrWhiteSpace(clientEmail) && app.UserId.HasValue && app.UserId.Value != Guid.Empty)
        {
            var ownerUser = await _userRepository.GetByIdAsync(app.UserId.Value, cancellationToken);
            clientEmail = ownerUser?.Email;
        }

        var fullName = detail != null
            ? $"{detail.FirstName} {detail.LastName}".Trim()
            : string.Empty;
        if (string.IsNullOrWhiteSpace(fullName))
        {
            fullName = company?.Name ?? (app.User != null ? $"{app.User.FirstName} {app.User.LastName}".Trim() : "Valued Applicant");
        }
        if (string.IsNullOrWhiteSpace(fullName))
        {
            fullName = "Valued Applicant";
        }

        var serviceName = service?.Name ?? "NTC Telecommunications Service";
        var serviceCode = service?.Code ?? string.Empty;
        var variantName = variant != null ? variant.Type.ToString() : "Standard Filing";
        var refNumber = !string.IsNullOrWhiteSpace(app.ApplicationNumber)
            ? app.ApplicationNumber
            : (!string.IsNullOrWhiteSpace(app.ReferenceNumber) ? app.ReferenceNumber : $"REF-{app.Id.ToString("N")[..8].ToUpperInvariant()}");

        bool isComplaint = service?.ServiceCategory?.Type == ServiceCategoryType.RequestsAndComplaints ||
                           serviceCode.Contains("1_24", StringComparison.OrdinalIgnoreCase) ||
                           serviceCode.Contains("1-24", StringComparison.OrdinalIgnoreCase) ||
                           serviceCode.Contains("1_25", StringComparison.OrdinalIgnoreCase) ||
                           serviceCode.Contains("1-25", StringComparison.OrdinalIgnoreCase) ||
                           serviceName.Contains("Complaint", StringComparison.OrdinalIgnoreCase) ||
                           serviceName.Contains("Blocking", StringComparison.OrdinalIgnoreCase) ||
                           serviceName.Contains("Unblocking", StringComparison.OrdinalIgnoreCase) ||
                           serviceName.Contains("Spam", StringComparison.OrdinalIgnoreCase) ||
                           serviceName.Contains("Scam", StringComparison.OrdinalIgnoreCase);

        var latestSoa = app.StatementsOfAccount?
            .Where(s => !s.IsDeleted)
            .OrderByDescending(s => s.CreatedAt)
            .FirstOrDefault();

        var latestOp = app.OrdersOfPayment?
            .Where(o => o.Status != OpStatus.Returned)
            .OrderByDescending(o => o.CreatedAt)
            .FirstOrDefault();

        var lineItems = latestSoa?.LineItems?.OrderBy(li => li.Description).ToList() ?? new List<SoaLineItem>();
        var fee1Name = lineItems.Count > 0 ? lineItems[0].Description : "Regulatory Filing & Processing Fee";
        var fee1Amount = lineItems.Count > 0 ? lineItems[0].Amount : (latestOp?.AmountDue ?? latestSoa?.TotalAmount ?? 0m);
        var fee2Name = lineItems.Count > 1 ? lineItems[1].Description : "Documentary Stamp Tax (DST) & Surcharges";
        var totalAmount = latestOp?.AmountDue ?? latestSoa?.TotalAmount ?? fee1Amount;

        var examDateStr = app.Schedule != null
            ? app.Schedule.StartDate.ToString("MMMM dd, yyyy", CultureInfo.InvariantCulture)
            : "N/A";

        var latestHistory = app.Histories?.OrderByDescending(h => h.Timestamp).FirstOrDefault();
        var latestDoc = app.IssuedDocumentDetails?.OrderByDescending(d => d.CreatedAt).FirstOrDefault();

        var clientPortalBaseUrl = _emailOptions.ClientPortalBaseUrl;
        var internalPortalBaseUrl = _emailOptions.InternalPortalBaseUrl;
        var systemName = "NTC EDGE Portal";
        var supportEmail = "support@ntc.gov.ph";

        if (_systemConfigRepository != null)
        {
            var clientUrlCfg = await _systemConfigRepository.GetByKeyAsync("CLIENT_PORTAL_BASE_URL", cancellationToken);
            if (clientUrlCfg != null && !string.IsNullOrWhiteSpace(clientUrlCfg.Value))
            {
                clientPortalBaseUrl = clientUrlCfg.Value.Trim();
            }

            var internalUrlCfg = await _systemConfigRepository.GetByKeyAsync("INTERNAL_PORTAL_BASE_URL", cancellationToken);
            if (internalUrlCfg != null && !string.IsNullOrWhiteSpace(internalUrlCfg.Value))
            {
                internalPortalBaseUrl = internalUrlCfg.Value.Trim();
            }

            var sysNameCfg = await _systemConfigRepository.GetByKeyAsync("SYSTEM_NAME", cancellationToken);
            if (sysNameCfg != null && !string.IsNullOrWhiteSpace(sysNameCfg.Value))
            {
                systemName = sysNameCfg.Value.Trim();
            }

            var supEmailCfg = await _systemConfigRepository.GetByKeyAsync("SUPPORT_EMAIL", cancellationToken);
            if (supEmailCfg != null && !string.IsNullOrWhiteSpace(supEmailCfg.Value))
            {
                supportEmail = supEmailCfg.Value.Trim();
            }
        }

        return new ResolvedApplicationContext
        {
            ClientEmail = clientEmail?.Trim() ?? string.Empty,
            ApplicantName = fullName,
            ReferenceNumber = refNumber,
            ServiceName = serviceName,
            ServiceVariantName = variantName,
            IsRequestOrComplaint = isComplaint,
            Fee1Name = fee1Name,
            Fee1AmountFormatted = fee1Amount.ToString("N2", CultureInfo.InvariantCulture),
            Fee2Name = fee2Name,
            TotalAmountFormatted = totalAmount.ToString("N2", CultureInfo.InvariantCulture),
            ExamDateFormatted = examDateStr,
            OrNumber = latestOp?.OfficialReceiptNumber ?? latestDoc?.OfficialReceiptNumber ?? "Pending",
            IssuedDocSummary = latestDoc != null ? $"{latestDoc.DocumentType} #{latestDoc.LicenseNumber ?? latestDoc.FormNumber}" : serviceName,
            LastStaffName = !string.IsNullOrWhiteSpace(latestHistory?.StaffName) ? latestHistory!.StaffName! : "Regional Officer",
            ClientPortalBaseUrl = clientPortalBaseUrl,
            InternalPortalBaseUrl = internalPortalBaseUrl,
            SystemName = systemName,
            SupportEmail = supportEmail
        };
    }

    private async Task<List<(string Email, string Name)>> ResolveTenantOfficersByRoleAsync(
        Guid tenantId,
        string targetRoleKeyword,
        CancellationToken cancellationToken)
    {
        var results = new List<(string Email, string Name)>();
        if (tenantId == Guid.Empty) return results;

        var members = await _tenantMemberRepository.GetMembersByTenantAsync(tenantId, cancellationToken)
                      ?? new List<TenantMember>();

        foreach (var member in members.Where(m => !m.IsDeleted && m.User != null && !string.IsNullOrWhiteSpace(m.User.Email)))
        {
            var roleKey = member.Role?.Key ?? string.Empty;
            var roleName = member.Role?.Name ?? string.Empty;
            bool matchesRole = false;

            if (string.Equals(targetRoleKeyword, "legal", StringComparison.OrdinalIgnoreCase))
            {
                matchesRole = member.RoleId == SeedConstants.Roles.LegalRoleId ||
                              roleKey.Contains("legal", StringComparison.OrdinalIgnoreCase) ||
                              roleName.Contains("Legal", StringComparison.OrdinalIgnoreCase);
            }
            else if (string.Equals(targetRoleKeyword, "evaluator", StringComparison.OrdinalIgnoreCase))
            {
                matchesRole = member.RoleId == SeedConstants.Roles.EvaluatorRoleId ||
                              roleKey.Contains("evaluator", StringComparison.OrdinalIgnoreCase) ||
                              roleName.Contains("Evaluator", StringComparison.OrdinalIgnoreCase);
            }
            else if (string.Equals(targetRoleKeyword, "accountant", StringComparison.OrdinalIgnoreCase))
            {
                matchesRole = member.RoleId == SeedConstants.Roles.AccountantRoleId ||
                              roleKey.Contains("accountant", StringComparison.OrdinalIgnoreCase) ||
                              roleName.Contains("Accountant", StringComparison.OrdinalIgnoreCase);
            }
            else if (string.Equals(targetRoleKeyword, "cashier", StringComparison.OrdinalIgnoreCase))
            {
                matchesRole = member.RoleId == SeedConstants.Roles.CashierRoleId ||
                              roleKey.Contains("cashier", StringComparison.OrdinalIgnoreCase) ||
                              roleName.Contains("Cashier", StringComparison.OrdinalIgnoreCase);
            }

            if (matchesRole)
            {
                var fullName = $"{member.User!.FirstName} {member.User.LastName}".Trim();
                if (string.IsNullOrWhiteSpace(fullName))
                {
                    fullName = member.Role?.Name ?? "Regional Officer";
                }
                results.Add((member.User.Email.Trim(), fullName));
            }
        }

        return results
            .GroupBy(r => r.Email, StringComparer.OrdinalIgnoreCase)
            .Select(g => g.First())
            .ToList();
    }

    private async Task CreateInAppNotificationAsync(
        Guid? userId,
        Guid tenantId,
        string title,
        string body,
        string actionUrl,
        string referenceId,
        CancellationToken cancellationToken)
    {
        if (!userId.HasValue || userId.Value == Guid.Empty) return;

        try
        {
            if (!await _applicationRepository.UserExistsAsync(userId.Value, cancellationToken))
            {
                return;
            }

            await _userNotificationRepository.CreateNotificationAsync(new UserNotification
            {
                UserId = userId.Value,
                TenantId = tenantId != Guid.Empty ? tenantId : null,
                Type = NotificationType.ApplicationStatusUpdate,
                Title = title,
                Body = body,
                ActionUrl = actionUrl,
                ReferenceId = referenceId,
                IsRead = false
            }, cancellationToken);

            if (_hubContext != null)
            {
                await _hubContext.Clients.All.SendAsync("ReceiveNotification", "ApplicationStatusUpdate", cancellationToken);
            }
        }
        catch (Exception ex)
        {
            _logger.LogDebug(ex, "Skipped creating in-app UserNotification for UserId '{UserId}'.", userId);
        }
    }

    private sealed class ResolvedApplicationContext
    {
        public string ClientEmail { get; init; } = string.Empty;
        public string ApplicantName { get; init; } = "Valued Applicant";
        public string ReferenceNumber { get; init; } = string.Empty;
        public string ServiceName { get; init; } = string.Empty;
        public string ServiceVariantName { get; init; } = string.Empty;
        public bool IsRequestOrComplaint { get; init; }
        public string Fee1Name { get; init; } = string.Empty;
        public string Fee1AmountFormatted { get; init; } = "0.00";
        public string Fee2Name { get; init; } = string.Empty;
        public string TotalAmountFormatted { get; init; } = "0.00";
        public string ExamDateFormatted { get; init; } = "N/A";
        public string OrNumber { get; init; } = string.Empty;
        public string IssuedDocSummary { get; init; } = string.Empty;
        public string LastStaffName { get; init; } = "Regional Officer";
        public string ClientPortalBaseUrl { get; init; } = "http://localhost:8081";
        public string InternalPortalBaseUrl { get; init; } = "http://localhost:8082";
        public string SystemName { get; init; } = "NTC EDGE Portal";
        public string SupportEmail { get; init; } = "support@ntc.gov.ph";
    }
}
