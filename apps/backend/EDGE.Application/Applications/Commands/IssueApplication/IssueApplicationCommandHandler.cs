using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.Extensions.Logging;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Domain.Authorization;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;

namespace EDGE.Application.Applications.Commands.IssueApplication;

public class IssueApplicationCommandHandler : IRequestHandler<IssueApplicationCommand, ApiResponse<IssuedDocumentDto>>
{
    private readonly IApplicationFullRepository _repository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;
    private readonly IUserRepository _userRepository;
    private readonly IUserAuthorizationService _userAuthService;
    private readonly ILogger<IssueApplicationCommandHandler> _logger;

    public IssueApplicationCommandHandler(
        IApplicationFullRepository repository,
        IUnitOfWork unitOfWork,
        ICurrentUserService currentUserService,
        IUserRepository userRepository,
        IUserAuthorizationService userAuthService,
        ILogger<IssueApplicationCommandHandler> logger)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
        _userRepository = userRepository;
        _userAuthService = userAuthService;
        _logger = logger;
    }

    public async Task<ApiResponse<IssuedDocumentDto>> Handle(IssueApplicationCommand request, CancellationToken cancellationToken)
    {
        // 1. Validate authorization: user must have IssueApplication, ApproveApplication, or regional evaluator/supervisor role
        var canIssue = await _userAuthService.HasAnyPermissionAsync(
            new[] { Permissions.IssueApplication, Permissions.ApproveApplication, Permissions.EvaluateApplication },
            cancellationToken);

        if (!canIssue)
        {
            var isStaff = await _userAuthService.HasAnyPermissionAsync(
                new[] { Permissions.ViewAllApplications, Permissions.ReadApplication },
                cancellationToken);

            if (!isStaff)
            {
                return ApiResponse<IssuedDocumentDto>.Fail(
                    "403 Forbidden: You do not have permission to issue documents and licenses.");
            }
        }

        // 2. Fetch Application with full details
        var app = await _repository.GetByIdWithDetailsAsync(request.ApplicationId, cancellationToken);
        if (app == null)
        {
            return ApiResponse<IssuedDocumentDto>.Fail("Application not found.");
        }

        // 3. Status validation: Application must be in ForIssuance (or PendingPayment if payment was recorded)
        if (app.Status != ApplicationStatus.ForIssuance && app.Status != ApplicationStatus.PendingPayment && app.Status != ApplicationStatus.Approved)
        {
            return ApiResponse<IssuedDocumentDto>.Fail(
                $"Cannot issue document. Application is not in 'ForIssuance' status (Current Status: {app.Status}).");
        }

        var userContext = await _userRepository.GetStaffUserContextAsync(_currentUserService.UserId, "Evaluator", cancellationToken);

        // 4. Resolve Original Evaluator from Application history (to identify alternate issuing officer)
        string? originalEvaluatorName = null;
        Guid? originalEvaluatorUserId = null;

        var evalHistory = app.Histories
            .OrderBy(h => h.Timestamp)
            .FirstOrDefault(h => h.ToStatus == ApplicationStatus.ForAccountant ||
                                (h.Action != null && h.Action.Contains("Evaluation", StringComparison.OrdinalIgnoreCase)));

        if (evalHistory != null)
        {
            originalEvaluatorName = evalHistory.StaffName;
            originalEvaluatorUserId = evalHistory.PerformedByUserId;
        }

        bool isAlternateIssuer = false;
        if (!string.IsNullOrWhiteSpace(originalEvaluatorName) &&
            !string.Equals(originalEvaluatorName.Trim(), userContext.StaffName.Trim(), StringComparison.OrdinalIgnoreCase))
        {
            isAlternateIssuer = true;
        }
        else
        {
            originalEvaluatorName = userContext.StaffName;
            originalEvaluatorUserId = userContext.UserId;
        }

        // 5. Cross-reference Official Receipt number from paid Order of Payment
        var paidOp = app.OrdersOfPayment.FirstOrDefault(o => o.Status == OpStatus.Paid);
        if (paidOp == null && app.OrdersOfPayment.Count > 0)
        {
            return ApiResponse<IssuedDocumentDto>.Fail("Cannot issue document. Payment has not been verified for this application.");
        }
        var orNumber = paidOp?.OfficialReceiptNumber;

        // 6. Generate secure verification token
        var qrVerificationCode = $"NTC-VERIFY-{Guid.NewGuid().ToString("N")[..12].ToUpper()}";

        // 7. Construct IssuedDocumentDetail
        var issuedDoc = new IssuedDocumentDetail
        {
            Id = Guid.NewGuid(),
            ApplicationId = app.Id,
            ApplicantId = request.ApplicantId ?? app.ApplicationApplicants.FirstOrDefault()?.ApplicantId,
            DocumentType = string.IsNullOrWhiteSpace(request.DocumentType) ? "Certificate" : request.DocumentType.Trim(),
            FormNumber = request.FormNumber.Trim(),
            LicenseNumber = string.IsNullOrWhiteSpace(request.LicenseNumber) ? null : request.LicenseNumber.Trim(),
            CallSign = string.IsNullOrWhiteSpace(request.CallSign) ? null : request.CallSign.Trim().ToUpper(),
            StationClass = string.IsNullOrWhiteSpace(request.StationClass) ? null : request.StationClass.Trim(),
            FrequencyBand = string.IsNullOrWhiteSpace(request.FrequencyBand) ? null : request.FrequencyBand.Trim(),
            IssueDate = request.IssueDate,
            ExpiryDate = request.ExpiryDate,
            OriginalEvaluatorUserId = originalEvaluatorUserId,
            OriginalEvaluatorName = originalEvaluatorName,
            IssuedByUserId = userContext.UserId,
            IssuedByStaffName = userContext.StaffName,
            IsAlternateIssuer = isAlternateIssuer,
            OfficialReceiptNumber = orNumber,
            QrVerificationCode = qrVerificationCode,
            Remarks = request.Remarks
        };

        await _repository.AddIssuedDocumentDetailAsync(issuedDoc, cancellationToken);

        // 8. Transition Application Status to Completed
        var prevAppStatus = app.Status;
        app.Status = ApplicationStatus.Completed;

        var historyAction = isAlternateIssuer
            ? $"Document & License issued by {userContext.StaffName} (Alternate Issuing Officer) on behalf of {originalEvaluatorName}. Form No: {issuedDoc.FormNumber}{(issuedDoc.LicenseNumber != null ? $", License: {issuedDoc.LicenseNumber}" : "")}"
            : $"Document & License issued by {userContext.StaffName}. Form No: {issuedDoc.FormNumber}{(issuedDoc.LicenseNumber != null ? $", License: {issuedDoc.LicenseNumber}" : "")}";

        await _repository.AddApplicationHistoryAsync(new ApplicationHistory
        {
            Id = Guid.NewGuid(),
            ApplicationId = app.Id,
            Action = historyAction,
            FromStatus = prevAppStatus,
            ToStatus = ApplicationStatus.Completed,
            PerformedByUserId = userContext.UserId,
            StaffName = userContext.StaffName,
            StaffRole = userContext.StaffRole,
            Timestamp = DateTime.UtcNow
        }, cancellationToken);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Application {ApplicationId} successfully issued by {StaffName}. FormNumber: {FormNumber}, LicenseNumber: {LicenseNumber}, IsAlternate: {IsAlternate}",
            app.Id, userContext.StaffName, issuedDoc.FormNumber, issuedDoc.LicenseNumber, isAlternateIssuer);

        var dto = new IssuedDocumentDto
        {
            Id = issuedDoc.Id,
            ApplicationId = issuedDoc.ApplicationId,
            ApplicantId = issuedDoc.ApplicantId,
            DocumentType = issuedDoc.DocumentType,
            FormNumber = issuedDoc.FormNumber,
            LicenseNumber = issuedDoc.LicenseNumber,
            CallSign = issuedDoc.CallSign,
            StationClass = issuedDoc.StationClass,
            FrequencyBand = issuedDoc.FrequencyBand,
            IssueDate = issuedDoc.IssueDate,
            ExpiryDate = issuedDoc.ExpiryDate,
            IssuedByStaffName = issuedDoc.IssuedByStaffName,
            OriginalEvaluatorName = issuedDoc.OriginalEvaluatorName,
            IsAlternateIssuer = issuedDoc.IsAlternateIssuer,
            OfficialReceiptNumber = issuedDoc.OfficialReceiptNumber,
            QrVerificationCode = issuedDoc.QrVerificationCode,
            Remarks = issuedDoc.Remarks
        };

        return ApiResponse<IssuedDocumentDto>.Success(dto, "Document and License issued successfully.");
    }
}
