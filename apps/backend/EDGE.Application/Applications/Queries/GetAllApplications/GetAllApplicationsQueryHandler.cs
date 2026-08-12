using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Applicants.Dtos;
using EDGE.Application.Applications.Dtos;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Applications.Queries.GetAllApplications;

public class GetAllApplicationsQueryHandler : IRequestHandler<GetAllApplicationsQuery, ApiResponse<List<ApplicationDto>>>
{
    private readonly IApplicationFullRepository _repository;
    private readonly ICurrentUserService _currentUserService;

    public GetAllApplicationsQueryHandler(IApplicationFullRepository repository, ICurrentUserService currentUserService)
    {
        _repository = repository;
        _currentUserService = currentUserService;
    }

    public async Task<ApiResponse<List<ApplicationDto>>> Handle(GetAllApplicationsQuery request, CancellationToken cancellationToken)
    {
        var userIdStr = _currentUserService.UserId;
        if (string.IsNullOrEmpty(userIdStr))
        {
            return ApiResponse<List<ApplicationDto>>.Fail("401 Unauthorized: Only authenticated users can retrieve applications.");
        }

        var applications = await _repository.GetAllApplicationsAsync(request.Status, request.QueueTab, request.Scope, cancellationToken);


        var dtos = applications.Select(app => new ApplicationDto
        {
            Id = app.Id,
            TenantId = app.TenantId,
            ScheduleId = app.ScheduleId,
            RegionId = app.RegionId,
            Office = app.Office,
            ApplicationNumber = app.ApplicationNumber,
            ReferenceNumber = app.ReferenceNumber,
            Status = app.Status.ToString(),
            SubmissionMode = app.SubmissionMode.ToString(),
            DataEntryMethod = app.DataEntryMethod?.ToString(),
            Remarks = app.Remarks,
            UserId = app.UserId,
            IsGuest = app.IsGuest,
            IsPinned = app.IsPinned,
            IsArchived = app.IsArchived,
            CreatedAt = app.CreatedAt,
            FilingUser = app.User != null ? new FilingUserDto
            {
                Id = app.User.Id,
                Name = $"{app.User.FirstName} {app.User.LastName}".Trim(),
                Email = app.User.Email,
                AccountType = app.User.AccountType.ToString(),
                Company = app.User.CompanyDetail != null ? new CompanyDetailDto
                {
                    Id = app.User.CompanyDetail.Id,
                    BarangayId = app.User.CompanyDetail.BarangayId,
                    Address = app.User.CompanyDetail.Address,
                    Name = app.User.CompanyDetail.Name,
                    RegistrationNumber = app.User.CompanyDetail.RegistrationNumber,
                    ContactNumber = app.User.CompanyDetail.ContactNumber,
                    Email = app.User.CompanyDetail.Email,
                    EntityType = app.User.CompanyDetail.EntityType?.ToString()
                } : null
            } : null,
            Services = app.ApplicationServices.Select(s => new ApplicationServiceDto
            {
                Id = s.Id,
                ServiceCategoryId = s.ServiceCategoryId,
                ServiceId = s.ServiceId,
                ServiceVariantId = s.ServiceVariantId,
                ApplicationTypeKey = s.ApplicationTypeKey,
                DynamicDataJson = s.DynamicDataJson
            }).ToList(),
            Applicants = app.ApplicationApplicants.Select(aa =>
            {
                var a = aa.Applicant;
                var dto = new ApplicantDto
                {
                    Id = a?.Id ?? Guid.Empty,
                    TenantId = a?.TenantId ?? Guid.Empty,
                    UserId = a?.UserId,
                    IsGuest = a?.IsGuest ?? true,
                    ApplicantType = a?.ApplicantType.ToString() ?? "Individual"
                };

                if (a?.ApplicantDetail != null)
                {
                    var ad = a.ApplicantDetail;
                    dto.Details = new ApplicantDetailDto
                    {
                        Id = ad.Id,
                        BarangayId = ad.BarangayId ?? Guid.Empty,
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
                        ZipCode = ad.ZipCode,
                        SchoolAttended = ad.SchoolAttended,
                        CourseTaken = ad.CourseTaken,
                        YearGraduated = ad.YearGraduated,
                        ESignature = ad.ESignature
                    };
                }

                var cd = a?.CompanyDetail ?? a?.ApplicantDetail?.CompanyDetail;
                if (cd != null)
                {
                    if (dto.Details == null)
                    {
                        dto.Details = new ApplicantDetailDto();
                    }
                    dto.Details.Company = new CompanyDetailDto
                    {
                        Id = cd.Id,
                        BarangayId = cd.BarangayId,
                        Address = cd.Address,
                        Name = cd.Name,
                        RegistrationNumber = cd.RegistrationNumber,
                        ContactNumber = cd.ContactNumber,
                        Email = cd.Email,
                        EntityType = cd.EntityType?.ToString()
                    };
                }

                if (a != null)
                {
                    var formSubmissionsForApplicant = app.FormSubmissions
                        .Where(fs => fs.ApplicantId == a.Id)
                        .ToList();

                    dto.FormFieldValues = formSubmissionsForApplicant
                        .SelectMany(fs => fs.FieldValues)
                        .Select(fv => new FormFieldValueDto
                        {
                            FieldId = fv.FieldId,
                            FieldLabel = fv.Field?.Label ?? string.Empty,
                            Value = fv.Value
                        })
                        .ToList();
                }

                return dto;
            }).ToList(),
            StatementsOfAccount = app.StatementsOfAccount.Select(s => new StatementOfAccountDto {
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
                LineItems = s.LineItems.Select(li => new SoaLineItemDto {
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
                Histories = s.Histories.Select(sh => new SoaHistoryDto {
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
            OrdersOfPayment = app.OrdersOfPayment.Select(op => new OrderOfPaymentDto {
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
                Histories = op.Histories.Select(oph => new OpHistoryDto {
                    Id = oph.Id,
                    Action = oph.Action,
                    FromStatus = oph.FromStatus?.ToString(),
                    ToStatus = oph.ToStatus.ToString(),
                    StaffName = oph.StaffName,
                    StaffRole = oph.StaffRole,
                    OfficialReceiptNumber = oph.OfficialReceiptNumber,
                    Remarks = oph.Remarks,
                    Timestamp = oph.Timestamp
                }).ToList()
            }).ToList(),
            Histories = app.Histories.Select(h => new ApplicationHistoryDto {
                Id = h.Id,
                Action = h.Action,
                FromStatus = h.FromStatus?.ToString(),
                ToStatus = h.ToStatus.ToString(),
                StaffName = h.StaffName,
                StaffRole = h.StaffRole,
                Remarks = h.Remarks,
                Timestamp = h.Timestamp
            }).ToList(),
            CorrectionAuditTrails = app.CorrectionAuditTrails.Select(c => new CorrectionAuditTrailDto {
                Id = c.Id,
                Category = c.Category,
                FieldName = c.FieldName,
                OldValue = c.OldValue,
                NewValue = c.NewValue,
                CorrectedByStaff = c.CorrectedByStaff,
                CorrectedAt = c.CorrectedAt
            }).ToList()
        }).ToList();

        return ApiResponse<List<ApplicationDto>>.Success(dtos, "User applications retrieved successfully.");
    }

    private static Guid CreateGuidFromString(string input)
    {
        using var md5 = MD5.Create();
        byte[] hash = md5.ComputeHash(Encoding.UTF8.GetBytes(input));
        return new Guid(hash);
    }
}
