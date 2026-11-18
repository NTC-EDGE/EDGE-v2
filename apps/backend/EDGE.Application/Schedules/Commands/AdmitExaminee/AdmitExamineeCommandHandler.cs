using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Application.Schedules.DTOs;
using EDGE.Domain.Entities;

namespace EDGE.Application.Schedules.Commands.AdmitExaminee;

public class AdmitExamineeCommandHandler
    : IRequestHandler<AdmitExamineeCommand, ApiResponse<ExamAdmissionVerificationDto>>
{
    private readonly IApplicationFullRepository _repository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;
    private readonly IUserRepository _userRepository;

    public AdmitExamineeCommandHandler(
        IApplicationFullRepository repository,
        IUnitOfWork unitOfWork,
        ICurrentUserService currentUserService,
        IUserRepository userRepository)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
        _userRepository = userRepository;
    }

    public async Task<ApiResponse<ExamAdmissionVerificationDto>> Handle(
        AdmitExamineeCommand request,
        CancellationToken cancellationToken)
    {
        Domain.Entities.Application? app = null;

        if (request.ApplicationId.HasValue && request.ApplicationId.Value != Guid.Empty)
        {
            app = await _repository.GetByIdWithDetailsAsync(request.ApplicationId.Value, cancellationToken);
        }

        if (app == null && !string.IsNullOrWhiteSpace(request.Code))
        {
            app = await _repository.FindExamApplicationByAdmissionCodeAsync(
                request.Code,
                request.TenantId,
                request.ScheduleId,
                cancellationToken);
        }

        if (app == null && request.IssuedDocumentId.HasValue && request.IssuedDocumentId.Value != Guid.Empty)
        {
            app = await _repository.FindExamApplicationByAdmissionCodeAsync(
                request.IssuedDocumentId.Value.ToString(),
                request.TenantId,
                request.ScheduleId,
                cancellationToken);
        }

        if (app == null)
        {
            return ApiResponse<ExamAdmissionVerificationDto>.Fail(
                "No matching Exam Admission Slip or application was found.");
        }

        var allExaminees = ExamAdmissionMapper.MapApplicationToExamineeDtos(app);
        if (allExaminees.Count == 0)
        {
            return ApiResponse<ExamAdmissionVerificationDto>.Fail("No examinee record found on this application.");
        }

        var cleanCode = request.Code?.Trim() ?? string.Empty;
        var stripped = cleanCode.StartsWith("NTC-VERIFY-", StringComparison.OrdinalIgnoreCase)
            ? cleanCode["NTC-VERIFY-".Length..].Trim()
            : cleanCode;

        var matchedExaminee = allExaminees.FirstOrDefault(e =>
            (request.IssuedDocumentId.HasValue && e.IssuedDocumentId == request.IssuedDocumentId.Value) ||
            (request.ApplicantId.HasValue && e.ApplicantId == request.ApplicantId.Value) ||
            (!string.IsNullOrEmpty(cleanCode) && (
                string.Equals(e.QrVerificationCode, cleanCode, StringComparison.OrdinalIgnoreCase) ||
                string.Equals(e.FormNumber, cleanCode, StringComparison.OrdinalIgnoreCase) ||
                string.Equals(e.FormNumber, stripped, StringComparison.OrdinalIgnoreCase) ||
                e.IssuedDocumentId.ToString("N").StartsWith(stripped, StringComparison.OrdinalIgnoreCase))))
            ?? allExaminees.First();

        if (!matchedExaminee.IsValidForAdmission)
        {
            return ApiResponse<ExamAdmissionVerificationDto>.Fail(matchedExaminee.ValidationMessage);
        }

        if (matchedExaminee.IsAdmitted)
        {
            return ApiResponse<ExamAdmissionVerificationDto>.Success(
                matchedExaminee,
                matchedExaminee.ValidationMessage);
        }

        var userContext = await _userRepository.GetStaffUserContextAsync(
            _currentUserService.UserId,
            "Examination Proctor",
            cancellationToken);

        Guid? validUserId = null;
        if (userContext.UserId.HasValue && await _repository.UserExistsAsync(userContext.UserId.Value, cancellationToken))
        {
            validUserId = userContext.UserId.Value;
        }

        var staffName = !string.IsNullOrWhiteSpace(userContext.StaffName)
            ? userContext.StaffName
            : (_currentUserService.Email ?? "Examination Officer");
        var staffRole = !string.IsNullOrWhiteSpace(userContext.StaffRole)
            ? userContext.StaffRole
            : "Examination Proctor";

        var docMarker = $"[ADMITTED_DOC:{matchedExaminee.IssuedDocumentId}]";
        var applicantMarker = matchedExaminee.ApplicantId.HasValue
            ? $"[ADMITTED_APPLICANT:{matchedExaminee.ApplicantId.Value}]"
            : string.Empty;

        var noteSuffix = !string.IsNullOrWhiteSpace(request.Remarks)
            ? $" Remarks: {request.Remarks.Trim()}"
            : string.Empty;

        var history = new ApplicationHistory
        {
            Id = Guid.NewGuid(),
            ApplicationId = app.Id,
            Action = $"Examinee Admitted to Examination ({matchedExaminee.ExamineeName})",
            FromStatus = app.Status,
            ToStatus = app.Status,
            PerformedByUserId = validUserId,
            StaffName = staffName,
            StaffRole = staffRole,
            Remarks = $"{docMarker}{applicantMarker} Admitted at examination venue via QR verification ({matchedExaminee.QrVerificationCode}). Form No: {matchedExaminee.FormNumber}.{noteSuffix}",
            Timestamp = DateTime.UtcNow
        };

        await _repository.AddApplicationHistoryAsync(history, cancellationToken);
        app.Histories.Add(history);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var updatedExaminees = ExamAdmissionMapper.MapApplicationToExamineeDtos(app);
        var updatedDto = updatedExaminees.FirstOrDefault(e => e.IssuedDocumentId == matchedExaminee.IssuedDocumentId)
            ?? matchedExaminee with
            {
                IsAdmitted = true,
                AdmittedAt = history.Timestamp,
                AdmittedByStaffName = staffName,
                AdmissionRemarks = $"Admitted at examination venue via QR verification ({matchedExaminee.QrVerificationCode}). Form No: {matchedExaminee.FormNumber}.{noteSuffix}",
                ValidationMessage = $"Examinee {matchedExaminee.ExamineeName} admitted to the examination."
            };

        return ApiResponse<ExamAdmissionVerificationDto>.Success(
            updatedDto,
            $"Examinee {updatedDto.ExamineeName} has been officially admitted to the examination.");
    }
}
