using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;

namespace EDGE.Application.Applications.Queries.GenerateNextDocumentNumber;

public class GenerateNextDocumentNumberQueryHandler : IRequestHandler<GenerateNextDocumentNumberQuery, ApiResponse<GeneratedDocumentNumbersDto>>
{
    private readonly IApplicationFullRepository _repository;

    public GenerateNextDocumentNumberQueryHandler(IApplicationFullRepository repository)
    {
        _repository = repository;
    }

    public async Task<ApiResponse<GeneratedDocumentNumbersDto>> Handle(GenerateNextDocumentNumberQuery request, CancellationToken cancellationToken)
    {
        var app = await _repository.GetByIdWithDetailsAsync(request.ApplicationId, cancellationToken);
        if (app == null)
        {
            return ApiResponse<GeneratedDocumentNumbersDto>.Fail("Application not found.");
        }

        var year = DateTime.UtcNow.Year;
        var regionCode = app.Region?.Code ?? app.Tenant?.Name?.Replace("Region", "R", StringComparison.OrdinalIgnoreCase).Replace(" ", "", StringComparison.OrdinalIgnoreCase) ?? "NCR";
        if (regionCode.Length > 10) regionCode = regionCode[..10].ToUpper();

        // Extract primary service details
        var primaryApplicant = app.ApplicationApplicants.FirstOrDefault()?.Applicant;
        var service = primaryApplicant?.Service;
        var primaryVariant = primaryApplicant?.ServiceVariant;
        var categoryName = service?.ServiceCategory?.Name ?? "General";
        var isLicense = service?.ServiceCategory?.Type == ServiceCategoryType.License;

        bool isRenewal = app.RenewedFromApplicationId.HasValue ||
                         primaryVariant?.Type == ServiceVariantType.Renewal ||
                         (primaryVariant?.Description != null && primaryVariant.Description.Contains("RENEWAL", StringComparison.OrdinalIgnoreCase)) ||
                         (service?.Name != null && service.Name.Contains("RENEWAL", StringComparison.OrdinalIgnoreCase));

        DateTime? previousExpiryDate = null;
        string? previousLicenseNumber = null;

        if (app.RenewedFromApplicationId.HasValue)
        {
            var prevApp = await _repository.GetByIdWithDetailsAsync(app.RenewedFromApplicationId.Value, cancellationToken);
            var prevDoc = prevApp?.IssuedDocumentDetails?.OrderByDescending(d => d.IssueDate).FirstOrDefault();
            if (prevDoc != null)
            {
                previousExpiryDate = prevDoc.ExpiryDate;
                previousLicenseNumber = prevDoc.LicenseNumber;
            }
        }

        if (!previousExpiryDate.HasValue || string.IsNullOrEmpty(previousLicenseNumber))
        {
            var allFields = app.FormSubmissions?.SelectMany(fs => fs.FieldValues).ToList() ?? new();
            if (string.IsNullOrEmpty(previousLicenseNumber))
            {
                previousLicenseNumber = allFields.FirstOrDefault(f => (f.Field?.Label != null && f.Field.Label.Contains("License No", StringComparison.OrdinalIgnoreCase)) || f.FieldId.ToString().Contains("202"))?.Value;
            }
            if (!previousExpiryDate.HasValue)
            {
                var expVal = allFields.FirstOrDefault(f => (f.Field?.Label != null && f.Field.Label.Contains("Expiry", StringComparison.OrdinalIgnoreCase)) || f.FieldId.ToString().Contains("203"))?.Value;
                if (!string.IsNullOrEmpty(expVal) && DateTime.TryParse(expVal, out var parsedExp))
                {
                    previousExpiryDate = parsedExp;
                }
            }
        }

        DateTime? recommendedExpiryDate = null;
        if (isRenewal && previousExpiryDate.HasValue)
        {
            // statutory rule: expiration attaches to the original expiration date + 1 year (or evaluator can set 2)
            recommendedExpiryDate = previousExpiryDate.Value.AddYears(1);
        }
        else if (isLicense)
        {
            recommendedExpiryDate = DateTime.UtcNow.AddYears(3);
        }
        else
        {
            recommendedExpiryDate = DateTime.UtcNow.AddYears(1);
        }

        var prefix = $"NTC-{regionCode.Trim().ToUpper()}-{year}";

        // Deterministic sequence generation based on existing issued document count + 1
        var existingIssued = await _repository.GetIssuedDocumentByApplicationIdAsync(app.Id, cancellationToken);
        if (existingIssued != null)
        {
            return ApiResponse<GeneratedDocumentNumbersDto>.Success(new GeneratedDocumentNumbersDto
            {
                RecommendedFormNumber = existingIssued.FormNumber,
                RecommendedLicenseNumber = existingIssued.LicenseNumber,
                ServiceCategory = categoryName,
                OfficePrefix = regionCode,
                SequenceNumber = 1,
                OfficialReceiptNumber = existingIssued.OfficialReceiptNumber,
                OriginalEvaluatorName = existingIssued.OriginalEvaluatorName ?? existingIssued.IssuedByStaffName,
                IsPaid = true,
                IsRenewal = isRenewal,
                PreviousExpiryDate = previousExpiryDate,
                RecommendedExpiryDate = existingIssued.ExpiryDate ?? recommendedExpiryDate,
                PreviousLicenseNumber = previousLicenseNumber
            });
        }

        // Generate pseudo-sequential number using deterministic timestamp/random seed
        var randomSeq = Random.Shared.Next(1001, 9999);
        var recommendedFormNumber = $"{prefix}-FORM-{randomSeq}";
        string? recommendedLicenseNumber = (isRenewal && !string.IsNullOrEmpty(previousLicenseNumber))
            ? previousLicenseNumber
            : (isLicense ? $"{prefix}-LIC-{randomSeq}" : null);

        var paidOp = app.OrdersOfPayment.FirstOrDefault(o => o.Status == OpStatus.Paid);
        var orNumber = paidOp?.OfficialReceiptNumber;

        var evalHistory = app.Histories
            .OrderBy(h => h.Timestamp)
            .FirstOrDefault(h => h.ToStatus == ApplicationStatus.ForAccountant ||
                                (h.Action != null && h.Action.Contains("Evaluation", StringComparison.OrdinalIgnoreCase)));

        var originalEvaluatorName = evalHistory?.StaffName;

        return ApiResponse<GeneratedDocumentNumbersDto>.Success(new GeneratedDocumentNumbersDto
        {
            RecommendedFormNumber = recommendedFormNumber,
            RecommendedLicenseNumber = recommendedLicenseNumber,
            ServiceCategory = categoryName,
            OfficePrefix = regionCode,
            SequenceNumber = randomSeq,
            OfficialReceiptNumber = orNumber,
            OriginalEvaluatorName = originalEvaluatorName,
            IsPaid = paidOp != null,
            IsRenewal = isRenewal,
            PreviousExpiryDate = previousExpiryDate,
            RecommendedExpiryDate = recommendedExpiryDate,
            PreviousLicenseNumber = previousLicenseNumber
        });
    }
}
