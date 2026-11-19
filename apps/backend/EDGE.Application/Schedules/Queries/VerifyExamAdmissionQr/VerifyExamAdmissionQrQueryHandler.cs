using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Application.Schedules.DTOs;

namespace EDGE.Application.Schedules.Queries.VerifyExamAdmissionQr;

public class VerifyExamAdmissionQrQueryHandler
    : IRequestHandler<VerifyExamAdmissionQrQuery, ApiResponse<ExamAdmissionVerificationDto>>
{
    private readonly IApplicationFullRepository _repository;

    public VerifyExamAdmissionQrQueryHandler(IApplicationFullRepository repository)
    {
        _repository = repository;
    }

    public async Task<ApiResponse<ExamAdmissionVerificationDto>> Handle(
        VerifyExamAdmissionQrQuery request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Code))
        {
            return ApiResponse<ExamAdmissionVerificationDto>.Fail("Please provide or scan a valid Exam Admission Slip QR code.");
        }

        var app = await _repository.FindExamApplicationByAdmissionCodeAsync(
            request.Code,
            request.TenantId,
            request.ScheduleId,
            cancellationToken);

        if (app == null)
        {
            return ApiResponse<ExamAdmissionVerificationDto>.Fail(
                $"No Exam Admission Slip found matching code '{request.Code.Trim()}'. Please verify the QR code or Admission Control Number.");
        }

        var allExaminees = ExamAdmissionMapper.MapApplicationToExamineeDtos(app);
        if (allExaminees.Count == 0)
        {
            return ApiResponse<ExamAdmissionVerificationDto>.Fail("No examinee record found on this application.");
        }

        var cleanCode = request.Code.Trim();
        var stripped = cleanCode.StartsWith("NTC-VERIFY-", StringComparison.OrdinalIgnoreCase)
            ? cleanCode["NTC-VERIFY-".Length..].Trim()
            : cleanCode;

        var matchedExaminee = allExaminees.FirstOrDefault(e =>
            string.Equals(e.QrVerificationCode, cleanCode, StringComparison.OrdinalIgnoreCase) ||
            string.Equals(e.FormNumber, cleanCode, StringComparison.OrdinalIgnoreCase) ||
            string.Equals(e.FormNumber, stripped, StringComparison.OrdinalIgnoreCase) ||
            string.Equals(e.LicenseNumber, cleanCode, StringComparison.OrdinalIgnoreCase) ||
            string.Equals(e.LicenseNumber, stripped, StringComparison.OrdinalIgnoreCase) ||
            e.IssuedDocumentId.ToString("N").StartsWith(stripped, StringComparison.OrdinalIgnoreCase) ||
            (e.ApplicantId.HasValue && e.ApplicantId.Value.ToString("N").StartsWith(stripped, StringComparison.OrdinalIgnoreCase)))
            ?? allExaminees.First();

        return ApiResponse<ExamAdmissionVerificationDto>.Success(
            matchedExaminee,
            matchedExaminee.ValidationMessage);
    }
}
