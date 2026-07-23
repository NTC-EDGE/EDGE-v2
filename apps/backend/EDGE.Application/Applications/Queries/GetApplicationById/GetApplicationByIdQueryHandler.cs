using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Applicants.Dtos;
using EDGE.Application.Applications.Dtos;
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
        var app = await _repository.GetByIdWithDetailsAsync(request.Id, cancellationToken);
        if (app == null)
        {
            return ApiResponse<ApplicationDto>.Fail($"Application with ID {request.Id} was not found.");
        }

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
            SubmissionMode = app.SubmissionMode.ToString(),
            DataEntryMethod = app.DataEntryMethod?.ToString(),
            Remarks = app.Remarks,
            UserId = app.UserId,
            IsGuest = app.IsGuest,
            CreatedAt = app.CreatedAt,
            Services = app.ApplicationServices.Select(s => new ApplicationServiceDto
            {
                Id = s.Id,
                ServiceCategoryId = s.ServiceCategoryId,
                ServiceId = s.ServiceId,
                ServiceVariantId = s.ServiceVariantId,
                ApplicationTypeKey = s.ApplicationTypeKey,
                DynamicDataJson = s.DynamicDataJson
            }).ToList(),
            Requirements = app.ApplicationRequirements.Select(r => new ApplicationRequirementDto
            {
                Id = r.Id,
                ApplicantId = r.ApplicantId,
                RequirementId = r.RequirementId,
                ServiceVariantRequirementId = r.ServiceVariantRequirementId,
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
                    ApplicantType = a?.ApplicantType.ToString() ?? "Individual"
                };

                if (a?.ApplicantDetail != null)
                {
                    var ad = a.ApplicantDetail;
                    applicantDto.Details = new ApplicantDetailDto
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

                    if (ad.CompanyDetail != null)
                    {
                        var cd = ad.CompanyDetail;
                        applicantDto.Details.Company = new CompanyDetailDto
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
                }

                return applicantDto;
            }).ToList()
        };

        return ApiResponse<ApplicationDto>.Success(dto, "Application details retrieved successfully.");
    }
}
