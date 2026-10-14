using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Applicants.Dtos;
using EDGE.Application.Applications.Dtos;
using EDGE.Application.Applications.Helpers;
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

        var primaryService = app.ApplicationApplicants.Select(aa => aa.Applicant?.Service).FirstOrDefault(s => s != null);
        var primaryVariant = app.ApplicationApplicants.Select(aa => aa.Applicant?.ServiceVariant).FirstOrDefault(v => v != null);

        var dto = new ApplicationDto
        {
            Id = app.Id,
            TenantId = app.TenantId,
            ScheduleId = app.ScheduleId,
            RegionId = app.RegionId,
            Office = app.Office,
            ApplicationNumber = app.ApplicationNumber,
            ReferenceNumber = app.ReferenceNumber,
            Status = app.Status.ToString(),
            Intent = app.Intent.ToString(),
            QueueTab = ApplicationStatusHelper.DetermineQueueTab(app.Status),
            SubmissionMode = app.SubmissionMode.ToString(),
            DataEntryMethod = app.DataEntryMethod?.ToString(),
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
            Services = app.ApplicationApplicants
                .Where(aa => aa.Applicant?.Service != null)
                .Select(aa => new ApplicationServiceDto
                {
                    Id = aa.ApplicantId,
                    ApplicantId = aa.ApplicantId,
                    ServiceId = aa.Applicant?.ServiceId,
                    ServiceName = aa.Applicant?.Service?.Name,
                    ServiceCategory = aa.Applicant?.Service?.ServiceCategory?.Name,
                    ServiceVariantId = aa.Applicant?.ServiceVariantId,
                    ServiceVariantName = aa.Applicant?.ServiceVariant?.Description ?? aa.Applicant?.ServiceVariant?.Type.ToString()
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
            FormSubmissions = app.FormSubmissions.Select(fs => new FormSubmissionSummaryDto
            {
                Id = fs.Id,
                FormId = fs.FormId,
                ApplicantId = fs.ApplicantId,
                CreatedAt = fs.CreatedAt
            }).ToList(),
            Requirements = app.ApplicationRequirements.Select(r => new ApplicationRequirementDto
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
            Applicants = app.ApplicationApplicants.Select(aa =>
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
                    SubmissionId = a?.FormSubmission != null ? a.FormSubmission.Id : app.FormSubmissions.FirstOrDefault(fs => fs.ApplicantId == a?.Id)?.Id
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
                    var formSubmissionsForApplicant = app.FormSubmissions
                        .Where(fs => fs.ApplicantId == a.Id || (app.ApplicationApplicants.Count == 1 && (fs.ApplicantId == Guid.Empty || fs.ApplicantId == app.Id)))
                        .ToList();

                    if (formSubmissionsForApplicant.Count == 0 && app.ApplicationApplicants.Count == 1)
                    {
                        formSubmissionsForApplicant = app.FormSubmissions.ToList();
                    }

                    applicantDto.FormFieldValues = formSubmissionsForApplicant
                        .SelectMany(fs => fs.FieldValues)
                        .Select(fv => new FormFieldValueDto
                        {
                            FieldId = fv.FieldId,
                            FieldLabel = !string.IsNullOrWhiteSpace(fv.Field?.Label) ? fv.Field.Label : (!string.IsNullOrWhiteSpace(fv.CustomLabel) ? fv.CustomLabel : "Field"),
                            Value = fv.Value
                        })
                        .ToList();
                }

                return applicantDto;
            }).ToList(),
            StatementsOfAccount = app.StatementsOfAccount.Select(s => new StatementOfAccountDto
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
                PreparedByUserId = s.PreparedByUserId,
                ApprovedByUserId = s.ApprovedByUserId,
                ApprovedAt = s.ApprovedAt,
                Remarks = s.Remarks,
                LineItems = s.LineItems.Select(li => new SoaLineItemDto
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
                Histories = s.Histories.Select(sh => new SoaHistoryDto
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
            OrdersOfPayment = app.OrdersOfPayment.Select(op => new OrderOfPaymentDto
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
                CheckNumber = op.CheckNumber,
                CheckName = op.CheckName,
                CheckBank = op.CheckBank,
                CheckDate = op.CheckDate,
                VerifiedByCashierId = op.VerifiedByCashierId,
                PaidAt = op.PaidAt,
                Remarks = op.Remarks,
                Histories = op.Histories.Select(oh => new OpHistoryDto
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
            Histories = app.Histories.Select(h => new ApplicationHistoryDto
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

        return ApiResponse<ApplicationDto>.Success(dto, "Application details retrieved successfully.");
    }
}
