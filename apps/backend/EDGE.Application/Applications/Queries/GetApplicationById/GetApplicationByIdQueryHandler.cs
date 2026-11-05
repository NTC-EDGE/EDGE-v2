using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Domain.Constants;
using EDGE.Domain.Enums;
using EDGE.Application.Applicants.Dtos;
using EDGE.Application.Applications.Dtos;
using EDGE.Application.Applications.Helpers;
using EDGE.Application.Common.Helpers;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Applications.Queries.GetApplicationById;

public class GetApplicationByIdQueryHandler : IRequestHandler<GetApplicationByIdQuery, ApiResponse<ApplicationDto>>
{
    private readonly IApplicationFullRepository _repository;

    public GetApplicationByIdQueryHandler(IApplicationFullRepository repository)
    {
        _repository = repository;
    }

    public async Task<ApiResponse<ApplicationDto>> Handle(GetApplicationByIdQuery request, CancellationToken cancellationToken)
    {
        var app = await _repository.GetByIdWithDetailsAsync(request.Id, asNoTracking: true, cancellationToken);
        if (app == null)
        {
            return ApiResponse<ApplicationDto>.Fail($"Application with ID {request.Id} was not found.");
        }

        var primaryService = (app.ApplicationApplicants ?? Enumerable.Empty<Domain.Entities.ApplicationApplicant>())
            .Select(aa => aa.Applicant?.Service)
            .FirstOrDefault(s => s != null);
        var primaryVariant = (app.ApplicationApplicants ?? Enumerable.Empty<Domain.Entities.ApplicationApplicant>())
            .Select(aa => aa.Applicant?.ServiceVariant)
            .FirstOrDefault(v => v != null);
        var paidOp = (app.OrdersOfPayment ?? Enumerable.Empty<Domain.Entities.OrderOfPayment>())
            .OrderByDescending(o => o.PaidAt ?? o.CreatedAt)
            .FirstOrDefault(o => o.Status == Domain.Enums.OpStatus.Paid || !string.IsNullOrWhiteSpace(o.OfficialReceiptNumber));

        var regionalSignatories = await _repository.GetRegionalSignatoriesAsync(app.TenantId, app.RegionId, cancellationToken);

        var rawOrSources = (app.OrdersOfPayment ?? Enumerable.Empty<Domain.Entities.OrderOfPayment>())
            .Where(o => o.Status != Domain.Enums.OpStatus.Returned)
            .Select(o => o.OfficialReceiptNumber)
            .Concat((app.IssuedDocumentDetails ?? Enumerable.Empty<Domain.Entities.IssuedDocumentDetail>()).Select(d => d.OfficialReceiptNumber))
            .Concat((app.OrdersOfPayment ?? Enumerable.Empty<Domain.Entities.OrderOfPayment>())
                .Where(o => o.Status != Domain.Enums.OpStatus.Returned)
                .SelectMany(o => o.Histories ?? Enumerable.Empty<Domain.Entities.OpHistory>())
                .Where(h => h.Action == null || (!h.Action.Contains("Returned", StringComparison.OrdinalIgnoreCase) && !h.Action.Contains("Cancel", StringComparison.OrdinalIgnoreCase)))
                .Select(h => h.OfficialReceiptNumber));

        var allOrNumbers = DelimitedStringHelper.ParseDistinctTokens(rawOrSources, comparer: StringComparer.OrdinalIgnoreCase);

        var resolvedOrNumber = allOrNumbers.Count > 0
            ? string.Join(", ", allOrNumbers)
            : paidOp?.OfficialReceiptNumber;

        var resolvedAmountPaid = (paidOp?.AmountReceived > 0)
            ? paidOp.AmountReceived
            : (app.OrdersOfPayment?.Where(o => o.Status == Domain.Enums.OpStatus.Paid || !string.IsNullOrWhiteSpace(o.OfficialReceiptNumber)).Sum(o => o.AmountReceived > 0 ? o.AmountReceived : o.AmountDue));

        var allHistories = (app.Histories ?? Enumerable.Empty<Domain.Entities.ApplicationHistory>())
            .Select(h => new { h.StaffName, h.StaffRole, h.Action, Remarks = (string?)h.Remarks, ToStatus = (Domain.Enums.ApplicationStatus?)h.ToStatus, h.Timestamp })
            .Concat((app.StatementsOfAccount ?? Enumerable.Empty<Domain.Entities.StatementOfAccount>())
                .SelectMany(s => s.Histories ?? Enumerable.Empty<Domain.Entities.SoaHistory>())
                .Select(sh => new { sh.StaffName, sh.StaffRole, sh.Action, Remarks = (string?)sh.Remarks, ToStatus = (Domain.Enums.ApplicationStatus?)null, sh.Timestamp }))
            .OrderByDescending(h => h.Timestamp)
            .ToList();

        var evaluatorHistory = allHistories.FirstOrDefault(h =>
            h.ToStatus == Domain.Enums.ApplicationStatus.ForAccountant ||
            (h.StaffRole != null && h.StaffRole.Contains("Evaluator", StringComparison.OrdinalIgnoreCase)) ||
            ((h.Action != null && (h.Action.Contains("Evaluation", StringComparison.OrdinalIgnoreCase) ||
                                   h.Action.Contains("SOA", StringComparison.OrdinalIgnoreCase))) &&
             (h.StaffRole == null || (!h.StaffRole.Contains("Accountant", StringComparison.OrdinalIgnoreCase) && !h.StaffRole.Contains("Cashier", StringComparison.OrdinalIgnoreCase)))));

        var resolvedEvaluatorName = evaluatorHistory?.StaffName;
        var resolvedEvaluatorTitle = regionalSignatories.GetResolvedEvaluatorTitle(evaluatorHistory?.StaffRole);
        var resolvedApproverName = regionalSignatories.GetResolvedApproverName();
        var resolvedApproverTitle = regionalSignatories.GetResolvedApproverTitle();

        var accountantHistory = allHistories.FirstOrDefault(h =>
            !string.IsNullOrWhiteSpace(h.StaffName) &&
            (h.StaffRole == null || (!h.StaffRole.Contains("Evaluator", StringComparison.OrdinalIgnoreCase) && !h.StaffRole.Contains("Engineer", StringComparison.OrdinalIgnoreCase))) &&
            (h.Action == null || (!h.Action.Contains("Forwarded to Accountant", StringComparison.OrdinalIgnoreCase) && !h.Action.Contains("Forward to Accountant", StringComparison.OrdinalIgnoreCase) && !h.Action.Contains("Approved & Forwarded", StringComparison.OrdinalIgnoreCase) && !h.Action.Contains("Re-submitted to Accountant", StringComparison.OrdinalIgnoreCase))) &&
            ((h.StaffRole != null && h.StaffRole.Contains("Accountant", StringComparison.OrdinalIgnoreCase)) ||
             (h.Action != null && (h.Action.Contains("Financial Review", StringComparison.OrdinalIgnoreCase) || h.Action.Contains("SOA Approved by Accountant", StringComparison.OrdinalIgnoreCase) || h.Action.Contains("Approved by Accountant", StringComparison.OrdinalIgnoreCase) || h.Action.Contains("Returned by Accountant", StringComparison.OrdinalIgnoreCase) || (h.Action.Contains("Take Application", StringComparison.OrdinalIgnoreCase) && h.ToStatus == Domain.Enums.ApplicationStatus.ForAccountant))) ||
             (h.Remarks != null && (h.Remarks.Contains("Financial review", StringComparison.OrdinalIgnoreCase) || h.Remarks.Contains("Approved by Accountant", StringComparison.OrdinalIgnoreCase) || h.Remarks.Contains("Returned by Accountant", StringComparison.OrdinalIgnoreCase)))));

        var resolvedAccountingOfficer = accountantHistory?.StaffName;

        var cashierHistory = allHistories.FirstOrDefault(h =>
            !string.IsNullOrWhiteSpace(h.StaffName) &&
            (h.StaffRole == null || (!h.StaffRole.Contains("Accountant", StringComparison.OrdinalIgnoreCase) && !h.StaffRole.Contains("Evaluator", StringComparison.OrdinalIgnoreCase))) &&
            (h.Action == null || (!h.Action.Contains("Forwarded to Cashier", StringComparison.OrdinalIgnoreCase) && !h.Action.Contains("Forward to Cashier", StringComparison.OrdinalIgnoreCase))) &&
            ((h.StaffRole != null && h.StaffRole.Contains("Cashier", StringComparison.OrdinalIgnoreCase)) ||
             (h.Action != null && (h.Action.Contains("Payment Verification", StringComparison.OrdinalIgnoreCase) || h.Action.Contains("Official Receipt", StringComparison.OrdinalIgnoreCase) || h.Action.Contains("OR Issued", StringComparison.OrdinalIgnoreCase) || (h.Action.Contains("Take Application", StringComparison.OrdinalIgnoreCase) && h.ToStatus == Domain.Enums.ApplicationStatus.PendingPayment))) ||
             (h.Remarks != null && (h.Remarks.Contains("Payment verification", StringComparison.OrdinalIgnoreCase) || h.Remarks.Contains("Official receipt", StringComparison.OrdinalIgnoreCase)))));

        var resolvedCashierOfficer = cashierHistory?.StaffName;

        var issuingHistory = allHistories.FirstOrDefault(h =>
            h.ToStatus == Domain.Enums.ApplicationStatus.Completed ||
            (h.Action != null && (
                h.Action.Contains("Document & License issued", StringComparison.OrdinalIgnoreCase) ||
                h.Action.Contains("Document Issuance", StringComparison.OrdinalIgnoreCase) ||
                h.Action.Contains("License issued", StringComparison.OrdinalIgnoreCase) ||
                h.Action.Contains("issued by", StringComparison.OrdinalIgnoreCase))));

        var resolvedIssuingOfficer = (app.IssuedDocumentDetails ?? Enumerable.Empty<Domain.Entities.IssuedDocumentDetail>())
            .OrderByDescending(d => d.IssueDate)
            .Select(d => d.IssuedByStaffName)
            .FirstOrDefault(name => !string.IsNullOrWhiteSpace(name))
            ?? issuingHistory?.StaffName;

        var dto = new ApplicationDto
        {
            Id = app.Id,
            TenantId = app.TenantId,
            ScheduleId = app.ScheduleId,
            RegionId = app.RegionId,
            Office = app.Office ?? (app.Tenant != null ? app.Tenant.Name : null),
            ApplicationNumber = app.ApplicationNumber,
            ReferenceNumber = app.ReferenceNumber,
            Status = app.Status.ToString(),
            Intent = app.Intent.ToString(),
            QueueTab = ApplicationStatusHelper.DetermineQueueTab(app.Status),
            SubmissionMode = app.SubmissionMode.ToString(),
            DataEntryMethod = app.DataEntryMethod?.ToString(),
            EvaluatingOfficer = resolvedEvaluatorName,
            AccountingOfficer = resolvedAccountingOfficer,
            CashierOfficer = resolvedCashierOfficer,
            IssuingOfficer = resolvedIssuingOfficer,
            Remarks = app.Remarks,
            UserId = app.UserId,
            IsGuest = app.IsGuest,
            AssessedAt = app.AssessedAt,
            ConvertedToRegularAt = app.ConvertedToRegularAt,
            AssessmentVersion = app.AssessmentVersion,
            AssessmentRemarks = app.AssessmentRemarks,
            CreatedAt = app.CreatedAt,
            ServiceId = primaryService?.Id,
            ServiceName = primaryService?.Name,
            ServiceCategoryId = primaryService?.ServiceCategoryId,
            ServiceCategory = primaryService?.ServiceCategory?.Name,
            ServiceCategoryName = primaryService?.ServiceCategory?.Name,
            ServiceCategoryCode = primaryService?.ServiceCategory?.Code,
            ServiceVariantName = primaryVariant?.Description ?? primaryVariant?.Type.ToString(),
            OfficialReceiptNumber = resolvedOrNumber,
            OrNumbers = allOrNumbers,
            AmountPaid = resolvedAmountPaid,
            PaidAt = paidOp?.PaidAt,
            Services = (app.ApplicationApplicants ?? Enumerable.Empty<Domain.Entities.ApplicationApplicant>())
                .Where(aa => aa.Applicant?.Service != null)
                .Select(aa => new ApplicationServiceDto
                {
                    Id = aa.ApplicantId,
                    ApplicantId = aa.ApplicantId,
                    ServiceId = aa.Applicant?.ServiceId,
                    ServiceName = aa.Applicant?.Service?.Name,
                    ServiceCategory = aa.Applicant?.Service?.ServiceCategory?.Name,
                    ServiceVariantId = aa.Applicant?.ServiceVariantId,
                    ServiceVariantName = aa.Applicant?.ServiceVariant?.Description ?? aa.Applicant?.ServiceVariant?.Type.ToString(),
                    SubmissionId = aa.Applicant?.FormSubmission?.Id ?? (app.FormSubmissions ?? Enumerable.Empty<Domain.Entities.FormSubmission>()).FirstOrDefault(fs => fs.ApplicantId == aa.ApplicantId)?.Id
                }).ToList(),
            FilingUser = app.User != null ? new FilingUserDto
            {
                Id = app.User.Id,
                Name = (app.User.FirstName + " " + app.User.LastName).Trim(),
                Email = app.User.Email,
                AccountType = app.User.AccountType.ToString(),
                Company = app.User.CompanyDetail != null ? new CompanyDetailDto
                {
                    Id = app.User.CompanyDetail.Id,
                    BarangayId = app.User.CompanyDetail.BarangayId,
                    BarangayName = app.User.CompanyDetail.Barangay?.Name ?? string.Empty,
                    CityMunicipalityName = app.User.CompanyDetail.Barangay?.Municipality?.Name,
                    ProvinceName = app.User.CompanyDetail.Barangay?.Municipality?.Province?.Name,
                    RegionName = app.User.CompanyDetail.Barangay?.Municipality?.Province?.Region?.Name,
                    Address = app.User.CompanyDetail.Address,
                    Name = app.User.CompanyDetail.Name,
                    RegistrationNumber = app.User.CompanyDetail.RegistrationNumber,
                    ContactNumber = app.User.CompanyDetail.ContactNumber,
                    Email = app.User.CompanyDetail.Email,
                    EntityType = app.User.CompanyDetail.EntityType?.ToString()
                } : null
            } : null,
            FormSubmissions = (app.FormSubmissions ?? Enumerable.Empty<Domain.Entities.FormSubmission>()).Select(fs => new FormSubmissionSummaryDto
            {
                Id = fs.Id,
                FormId = fs.FormId,
                ApplicantId = fs.ApplicantId,
                CreatedAt = fs.CreatedAt
            }).ToList(),
            Requirements = (app.ApplicationRequirements ?? Enumerable.Empty<Domain.Entities.ApplicationRequirement>()).Select(r => new ApplicationRequirementDto
            {
                Id = r.Id,
                ApplicantId = r.ApplicantId,
                RequirementId = r.RequirementId,
                ServiceVariantRequirementId = r.ServiceVariantRequirementId,
                StoredFileId = r.StoredFileId,
                FileName = r.StoredFile?.FileName ?? (!string.IsNullOrEmpty(r.Url) ? Path.GetFileName(r.Url) : null),
                ContentType = r.StoredFile?.ContentType,
                FileSizeBytes = r.StoredFile?.FileSizeBytes,
                Url = r.Url,
                IsApproved = r.IsApproved
            }).ToList(),
            Applicants = (app.ApplicationApplicants ?? Enumerable.Empty<Domain.Entities.ApplicationApplicant>()).Select(aa =>
            {
                var a = aa.Applicant;
                var applicantDto = new ApplicantDto
                {
                    Id = a?.Id ?? Guid.Empty,
                    TenantId = a?.TenantId ?? Guid.Empty,
                    UserId = a?.UserId,
                    IsGuest = a?.IsGuest ?? true,
                    ApplicantType = a?.ApplicantType.ToString() ?? "Individual",
                    Status = a?.Status.ToString() ?? "Incomplete",
                    EvaluationRemarks = a?.EvaluationRemarks,
                    ServiceId = a?.ServiceId,
                    ServiceVariantId = a?.ServiceVariantId,
                    ServiceVariantName = a?.ServiceVariant?.Description ?? a?.ServiceVariant?.Type.ToString() ?? primaryVariant?.Description ?? primaryVariant?.Type.ToString(),
                    SubmissionId = a?.FormSubmission != null ? a.FormSubmission.Id : (app.FormSubmissions ?? Enumerable.Empty<Domain.Entities.FormSubmission>()).FirstOrDefault(fs => fs.ApplicantId == a?.Id)?.Id
                };

                if (a?.ApplicantDetail != null)
                {
                    var ad = a.ApplicantDetail;
                    applicantDto.Details = new ApplicantDetailDto
                    {
                        Id = ad.Id,
                        BarangayId = ad.BarangayId ?? Guid.Empty,
                        BarangayName = ad.Barangay?.Name ?? string.Empty,
                        CityMunicipalityName = ad.Barangay?.Municipality?.Name,
                        ProvinceName = ad.Barangay?.Municipality?.Province?.Name,
                        RegionName = ad.Barangay?.Municipality?.Province?.Region?.Name,
                        Address = ad.Address,
                        FirstName = ad.FirstName,
                        MiddleName = ad.MiddleName,
                        LastName = ad.LastName,
                        Suffix = ad.Suffix,
                        Nationality = ad.Nationality,
                        Sex = ad.Sex,
                        Height = ad.Height,
                        Weight = ad.Weight,
                        BirthDate = ad.BirthDate,
                        ContactNumber = ad.ContactNumber,
                        EmailAddress = ad.EmailAddress,
                        ZipCode = ad.ZipCode,
                        SchoolAttended = ad.SchoolAttended,
                        CourseTaken = ad.CourseTaken,
                        YearGraduated = ad.YearGraduated,
                        ESignature = ad.ESignature
                    };
                }

                if (a?.CompanyDetail != null || a?.ApplicantDetail?.CompanyDetail != null)
                {
                    var cd = a?.CompanyDetail ?? a?.ApplicantDetail?.CompanyDetail;
                    if (cd != null)
                    {
                        applicantDto.Company = new CompanyDetailDto
                        {
                            Id = cd.Id,
                            BarangayId = cd.BarangayId,
                            BarangayName = cd.Barangay?.Name ?? string.Empty,
                            CityMunicipalityName = cd.Barangay?.Municipality?.Name,
                            ProvinceName = cd.Barangay?.Municipality?.Province?.Name,
                            RegionName = cd.Barangay?.Municipality?.Province?.Region?.Name,
                            Address = cd.Address,
                            Name = cd.Name,
                            RegistrationNumber = cd.RegistrationNumber,
                            ContactNumber = cd.ContactNumber,
                            Email = cd.Email,
                            EntityType = cd.EntityType?.ToString()
                        };
                    }
                }

                if (a != null)
                {
                    var formSubmissionsForApplicant = (app.FormSubmissions ?? Enumerable.Empty<Domain.Entities.FormSubmission>())
                        .Where(fs => fs.ApplicantId == a.Id || ((app.ApplicationApplicants?.Count ?? 0) == 1 && (fs.ApplicantId == Guid.Empty || fs.ApplicantId == app.Id)))
                        .ToList();

                    if (formSubmissionsForApplicant.Count == 0 && (app.ApplicationApplicants?.Count ?? 0) == 1)
                    {
                        formSubmissionsForApplicant = (app.FormSubmissions ?? Enumerable.Empty<Domain.Entities.FormSubmission>()).ToList();
                    }

                    applicantDto.FormFieldValues = formSubmissionsForApplicant
                        .SelectMany(fs => fs.FieldValues ?? Enumerable.Empty<Domain.Entities.FormFieldValue>())
                        .Select(fv => new FormFieldValueDto
                        {
                            FieldId = fv.FieldId,
                            FieldLabel = !string.IsNullOrWhiteSpace(fv.Field?.Label) ? fv.Field.Label : (!string.IsNullOrWhiteSpace(fv.CustomLabel) ? fv.CustomLabel : "Field"),
                            Value = fv.Value
                        })
                        .ToList();

                    var applicantElement = applicantDto.FormFieldValues.FirstOrDefault(fv =>
                        fv != null &&
                        (FormFieldConstants.ElementFieldIds.Contains(fv.FieldId) ||
                        fv.FieldLabel.Contains("element", StringComparison.OrdinalIgnoreCase) ||
                        fv.FieldLabel.Contains("station class", StringComparison.OrdinalIgnoreCase)))?.Value;

                    if (!string.IsNullOrWhiteSpace(applicantElement) && Guid.TryParse(applicantElement, out var parsedElemGuid))
                    {
                        var matchedElem = a?.ServiceVariant?.ServiceVariantElements?.FirstOrDefault(e => e.Id == parsedElemGuid)
                            ?? primaryVariant?.ServiceVariantElements?.FirstOrDefault(e => e.Id == parsedElemGuid);
                        if (matchedElem != null)
                        {
                            applicantElement = !string.IsNullOrWhiteSpace(matchedElem.Code) && !string.IsNullOrWhiteSpace(matchedElem.Description)
                                ? $"{matchedElem.Code} — {matchedElem.Description}"
                                : (!string.IsNullOrWhiteSpace(matchedElem.Description) ? matchedElem.Description : matchedElem.Code);
                        }
                    }

                    if (string.IsNullOrWhiteSpace(applicantElement) && a?.ServiceVariant?.ServiceVariantElements != null && a.ServiceVariant.ServiceVariantElements.Any())
                    {
                        var firstElem = a.ServiceVariant.ServiceVariantElements.FirstOrDefault();
                        if (firstElem != null)
                        {
                            applicantElement = !string.IsNullOrWhiteSpace(firstElem.Code) && !string.IsNullOrWhiteSpace(firstElem.Description)
                                ? $"{firstElem.Code} — {firstElem.Description}"
                                : (!string.IsNullOrWhiteSpace(firstElem.Description) ? firstElem.Description : firstElem.Code);
                        }
                    }

                    applicantDto.Element = applicantElement;
                }

                return applicantDto;
            }).ToList(),
            StatementsOfAccount = (app.StatementsOfAccount ?? Enumerable.Empty<Domain.Entities.StatementOfAccount>()).Select(s => new StatementOfAccountDto
            {
                Id = s.Id,
                ApplicationId = s.ApplicationId,
                ApplicantId = s.ApplicantId,
                SoaNumber = s.SoaNumber,
                Status = s.Status.ToString(),
                IssuedToType = s.IssuedToType.ToString(),
                IssuedToName = s.IssuedToName,
                IssuedToAddress = s.IssuedToAddress,
                TotalAmount = s.TotalAmount,
                DueDate = s.DueDate,
                CreatedAt = s.CreatedAt,
                PreparedByUserId = s.PreparedByUserId,
                ApprovedByUserId = s.ApprovedByUserId,
                ApprovedAt = s.ApprovedAt,
                Remarks = s.Remarks,
                SoaNoteId = s.SoaNoteId,
                SoaNoteText = s.SoaNote != null ? s.SoaNote.Notes : null,
                OrNumbers = allOrNumbers,
                PreparedByName = regionalSignatories.GetResolvedEvaluatorName(resolvedEvaluatorName),
                PreparedByTitle = resolvedEvaluatorTitle,
                ApprovedByName = resolvedApproverName,
                ApprovedByTitle = resolvedApproverTitle,
                LineItems = (s.LineItems ?? Enumerable.Empty<Domain.Entities.SoaLineItem>()).Select(li => new SoaLineItemDto
                {
                    Id = li.Id,
                    Particular = li.Particular,
                    ItemCode = li.ItemCode,
                    Description = li.Description,
                    PeriodOfCoverageStart = li.PeriodOfCoverageStart,
                    PeriodOfCoverageEnd = li.PeriodOfCoverageEnd,
                    ValidityYears = li.ValidityYears,
                    NoOfUnits = li.NoOfUnits,
                    FeeRate = li.FeeRate,
                    Amount = li.Amount
                }).ToList(),
                Histories = (s.Histories ?? Enumerable.Empty<Domain.Entities.SoaHistory>()).Select(sh => new SoaHistoryDto
                {
                    Id = sh.Id,
                    Action = sh.Action,
                    FromStatus = sh.FromStatus?.ToString(),
                    ToStatus = sh.ToStatus.ToString(),
                    StaffName = sh.StaffName,
                    StaffRole = sh.StaffRole,
                    Remarks = sh.Remarks,
                    Timestamp = sh.Timestamp
                }).ToList()
            }).ToList(),
            OrdersOfPayment = (app.OrdersOfPayment ?? Enumerable.Empty<Domain.Entities.OrderOfPayment>()).Select(op => new OrderOfPaymentDto
            {
                Id = op.Id,
                ApplicationId = op.ApplicationId,
                StatementOfAccountId = op.StatementOfAccountId,
                OpNumber = op.OpNumber,
                Status = op.Status.ToString(),
                AmountDue = op.AmountDue,
                AmountReceived = op.AmountReceived,
                PaymentMethod = op.PaymentMethod?.ToString(),
                OfficialReceiptNumber = op.OfficialReceiptNumber,
                OrNumbers = allOrNumbers,
                CheckNumber = op.CheckNumber,
                CheckName = op.CheckName,
                CheckBank = op.CheckBank,
                CheckDate = op.CheckDate,
                VerifiedByCashierId = op.VerifiedByCashierId,
                PaidAt = op.PaidAt,
                Remarks = op.Remarks,
                Histories = (op.Histories ?? Enumerable.Empty<Domain.Entities.OpHistory>()).Select(oh => new OpHistoryDto
                {
                    Id = oh.Id,
                    Action = oh.Action,
                    FromStatus = oh.FromStatus?.ToString(),
                    ToStatus = oh.ToStatus.ToString(),
                    StaffName = oh.StaffName,
                    StaffRole = oh.StaffRole,
                    OfficialReceiptNumber = oh.OfficialReceiptNumber,
                    Remarks = oh.Remarks,
                    Timestamp = oh.Timestamp
                }).ToList()
            }).ToList(),
            Histories = (app.Histories ?? Enumerable.Empty<Domain.Entities.ApplicationHistory>()).Select(h => new ApplicationHistoryDto
            {
                Id = h.Id,
                Action = h.Action,
                FromStatus = h.FromStatus?.ToString(),
                ToStatus = h.ToStatus.ToString(),
                StaffName = h.StaffName,
                StaffRole = h.StaffRole,
                Remarks = h.Remarks,
                Timestamp = h.Timestamp
            }).ToList(),
            RenewedFromApplicationId = app.RenewedFromApplicationId,
            HasActiveRenewal = (app.Renewals ?? Enumerable.Empty<Domain.Entities.Application>()).Any(r => r.Status != ApplicationStatus.Draft && r.Status != ApplicationStatus.Returned),
            ActiveRenewalApplicationId = (app.Renewals ?? Enumerable.Empty<Domain.Entities.Application>()).Where(r => r.Status != ApplicationStatus.Draft && r.Status != ApplicationStatus.Returned).Select(r => (Guid?)r.Id).FirstOrDefault(),
            ActiveRenewalReferenceNumber = (app.Renewals ?? Enumerable.Empty<Domain.Entities.Application>()).Where(r => r.Status != ApplicationStatus.Draft && r.Status != ApplicationStatus.Returned).Select(r => r.ReferenceNumber).FirstOrDefault(),
            IssuedDocumentDetails = (app.IssuedDocumentDetails ?? Enumerable.Empty<Domain.Entities.IssuedDocumentDetail>()).Select(d => new IssuedDocumentDetailSummaryDto
            {
                Id = d.Id,
                ApplicationId = d.ApplicationId,
                ApplicantId = d.ApplicantId,
                DocumentType = d.DocumentType,
                FormNumber = d.FormNumber,
                LicenseNumber = d.LicenseNumber,
                CallSign = d.CallSign,
                StationClass = d.StationClass,
                FrequencyBand = d.FrequencyBand,
                IssueDate = d.IssueDate,
                ExpiryDate = d.ExpiryDate,
                OriginalEvaluatorUserId = d.OriginalEvaluatorUserId,
                OriginalEvaluatorName = d.OriginalEvaluatorName,
                IssuedByUserId = d.IssuedByUserId,
                IssuedByStaffName = d.IssuedByStaffName,
                IsAlternateIssuer = d.IsAlternateIssuer,
                OfficialReceiptNumber = d.OfficialReceiptNumber,
                QrVerificationCode = d.QrVerificationCode,
                DocumentFileUrl = d.DocumentFileUrl,
                Remarks = d.Remarks
            }).ToList(),
            CorrectionAuditTrails = app.CorrectionAuditTrails.Select(c => new CorrectionAuditTrailDto
            {
                Id = c.Id,
                Category = c.Category,
                FieldName = c.FieldName,
                OldValue = c.OldValue,
                NewValue = c.NewValue,
                CorrectedByStaff = c.CorrectedByStaff,
                CorrectedAt = c.CorrectedAt
            }).ToList()
        };

        dto.Element = dto.Applicants.FirstOrDefault(a => !string.IsNullOrWhiteSpace(a.Element))?.Element;
        if (string.IsNullOrWhiteSpace(dto.Element))
        {
            var allFvs = (app.FormSubmissions ?? Enumerable.Empty<Domain.Entities.FormSubmission>())
                .Where(fs => fs != null)
                .SelectMany(fs => fs.FieldValues ?? Enumerable.Empty<Domain.Entities.FormFieldValue>())
                .Where(fv => fv != null)
                .ToList();
            var matchFv = allFvs.FirstOrDefault(fv =>
                FormFieldConstants.ElementFieldIds.Contains(fv.FieldId) ||
                (fv.Field?.Label != null && (fv.Field.Label.Contains("element", StringComparison.OrdinalIgnoreCase) || fv.Field.Label.Contains("station class", StringComparison.OrdinalIgnoreCase))) ||
                (fv.CustomLabel != null && (fv.CustomLabel.Contains("element", StringComparison.OrdinalIgnoreCase) || fv.CustomLabel.Contains("station class", StringComparison.OrdinalIgnoreCase))));
            if (matchFv != null && !string.IsNullOrWhiteSpace(matchFv.Value))
            {
                var val = matchFv.Value;
                if (Guid.TryParse(val, out var parsedMatchGuid))
                {
                    var matchedElem = primaryVariant?.ServiceVariantElements?.FirstOrDefault(e => e.Id == parsedMatchGuid);
                    if (matchedElem != null)
                    {
                        val = !string.IsNullOrWhiteSpace(matchedElem.Code) && !string.IsNullOrWhiteSpace(matchedElem.Description)
                            ? $"{matchedElem.Code} — {matchedElem.Description}"
                            : (!string.IsNullOrWhiteSpace(matchedElem.Description) ? matchedElem.Description : matchedElem.Code);
                    }
                }
                dto.Element = val;
            }
        }
        if (string.IsNullOrWhiteSpace(dto.Element) && primaryVariant?.ServiceVariantElements != null && primaryVariant.ServiceVariantElements.Any())
        {
            var firstElem = primaryVariant.ServiceVariantElements.FirstOrDefault();
            if (firstElem != null)
            {
                dto.Element = !string.IsNullOrWhiteSpace(firstElem.Code) && !string.IsNullOrWhiteSpace(firstElem.Description)
                    ? $"{firstElem.Code} — {firstElem.Description}"
                    : (!string.IsNullOrWhiteSpace(firstElem.Description) ? firstElem.Description : firstElem.Code);
            }
        }

        foreach (var svc in dto.Services)
        {
            if (string.IsNullOrWhiteSpace(svc.Element))
            {
                var matchedApplicant = dto.Applicants.FirstOrDefault(a => a.Id == svc.ApplicantId);
                svc.Element = matchedApplicant?.Element ?? dto.Element;
            }
        }

        return ApiResponse<ApplicationDto>.Success(dto, "Application details retrieved successfully.");
    }
}