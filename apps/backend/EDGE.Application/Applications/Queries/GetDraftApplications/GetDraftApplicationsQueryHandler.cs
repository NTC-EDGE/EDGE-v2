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

namespace EDGE.Application.Applications.Queries.GetDraftApplications;

public class GetDraftApplicationsQueryHandler : IRequestHandler<GetDraftApplicationsQuery, ApiResponse<List<ApplicationDto>>>
{
    private readonly IApplicationFullRepository _repository;
    private readonly ICurrentUserService _currentUserService;

    public GetDraftApplicationsQueryHandler(IApplicationFullRepository repository, ICurrentUserService currentUserService)
    {
        _repository = repository;
        _currentUserService = currentUserService;
    }

    public async Task<ApiResponse<List<ApplicationDto>>> Handle(GetDraftApplicationsQuery request, CancellationToken cancellationToken)
    {
        var userIdStr = _currentUserService.UserId;
        if (string.IsNullOrEmpty(userIdStr))
        {
            return ApiResponse<List<ApplicationDto>>.Fail("401 Unauthorized: Only authenticated users can retrieve saved drafts.");
        }

        Guid userId = Guid.TryParse(userIdStr, out var parsed) ? parsed : CreateGuidFromString(userIdStr);
        var drafts = await _repository.GetUserDraftsAsync(userId, cancellationToken);

        var dtos = drafts.Select(app => new ApplicationDto
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
            Applicants = app.ApplicationApplicants.Select(aa =>
            {
                var a = aa.Applicant;
                var dto = new ApplicantDto
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
            }).ToList()
        }).ToList();

        return ApiResponse<List<ApplicationDto>>.Success(dtos, "User draft applications retrieved successfully.");
    }

    private static Guid CreateGuidFromString(string input)
    {
        using var md5 = MD5.Create();
        byte[] hash = md5.ComputeHash(Encoding.UTF8.GetBytes(input));
        return new Guid(hash);
    }
}
