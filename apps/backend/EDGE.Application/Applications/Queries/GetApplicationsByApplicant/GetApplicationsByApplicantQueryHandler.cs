using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Applications.Queries.GetApplicationsByApplicant;

public class GetApplicationsByApplicantQueryHandler : IRequestHandler<GetApplicationsByApplicantQuery, ApiResponse<List<ApplicantApplicationDto>>>
{
    private readonly IApplicationFullRepository _applicationRepository;
    private readonly IApplicantRepository _applicantRepository;

    public GetApplicationsByApplicantQueryHandler(
        IApplicationFullRepository applicationRepository,
        IApplicantRepository applicantRepository)
    {
        _applicationRepository = applicationRepository;
        _applicantRepository = applicantRepository;
    }

    public async Task<ApiResponse<List<ApplicantApplicationDto>>> Handle(GetApplicationsByApplicantQuery request, CancellationToken cancellationToken)
    {
        var applicant = await _applicantRepository.GetApplicantWithDetailsByIdAsync(request.ApplicantId, cancellationToken);
        if (applicant == null)
        {
            return ApiResponse<List<ApplicantApplicationDto>>.Fail($"Applicant with ID '{request.ApplicantId}' was not found.");
        }

        var applications = await _applicationRepository.GetByApplicantIdAsync(request.ApplicantId, cancellationToken);

        var dtos = new List<ApplicantApplicationDto>();

        foreach (var app in applications)
        {
            var appApplicant = app.ApplicationApplicants.FirstOrDefault(aa => aa.ApplicantId == request.ApplicantId)
                            ?? app.ApplicationApplicants.FirstOrDefault();

            var targetApplicant = appApplicant?.Applicant ?? applicant;
            var detail = targetApplicant.ApplicantDetail;

            var applicantName = detail != null
                ? $"{detail.FirstName} {detail.LastName}".Trim()
                : "Applicant";

            var serviceName = targetApplicant.Service?.Name ?? "NTC Regulatory Service";
            var serviceCategory = targetApplicant.Service?.ServiceCategory?.Name ?? "Licensing & Certification";

            var documents = app.ApplicationRequirements.Select(req => new ApplicantDocumentDto(
                Id: req.Id.ToString(),
                Name: req.StoredFileId.HasValue ? $"Document_{req.StoredFileId.Value.ToString().Substring(0, 8)}" : "Requirement Document",
                Type: "DOCUMENT",
                Size: "N/A",
                Category: req.RequirementId.ToString(),
                UploadedAt: req.CreatedAt
            )).ToList();

            dtos.Add(new ApplicantApplicationDto(
                Id: app.Id,
                ReferenceNumber: app.ReferenceNumber ?? app.ApplicationNumber ?? $"REF-{app.Id.ToString().Substring(0, 8).ToUpper()}",
                Mode: app.SubmissionMode.ToString().ToUpper(),
                ServiceName: serviceName,
                ServiceCategory: serviceCategory,
                Element: "New",
                Status: app.Status.ToString().ToUpper(),
                SubmittedAt: app.CreatedAt,
                ApplicantName: string.IsNullOrWhiteSpace(applicantName) ? "N/A" : applicantName,
                Sex: detail?.Sex ?? "N/A",
                Nationality: detail?.Nationality ?? "Filipino",
                StreetAddress: detail?.Address ?? "N/A",
                Barangay: detail?.Barangay?.Name ?? "N/A",
                CityMunicipality: detail?.Barangay?.Municipality?.Name ?? "N/A",
                Province: detail?.Barangay?.Municipality?.Province?.Name ?? "N/A",
                Region: detail?.Barangay?.Municipality?.Province?.Region?.Name ?? "N/A",
                ZipCode: detail?.ZipCode ?? "N/A",
                MobileNumber: detail?.ContactNumber ?? "N/A",
                Email: detail?.EmailAddress ?? "N/A",
                ExamineeType: "New",
                Schedule: null,
                Documents: documents
            ));
        }

        return ApiResponse<List<ApplicantApplicationDto>>.Success(dtos, "Applications retrieved successfully for applicant.");
    }
}
