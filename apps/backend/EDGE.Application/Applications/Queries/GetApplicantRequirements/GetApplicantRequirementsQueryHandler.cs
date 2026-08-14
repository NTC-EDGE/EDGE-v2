using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Applications.Queries.GetApplicantRequirements;

public class GetApplicantRequirementsQueryHandler
    : IRequestHandler<GetApplicantRequirementsQuery, ApiResponse<List<ApplicantRequirementItemDto>>>
{
    private readonly IApplicationFullRepository _applicationRepository;
    private readonly IRequirementRepository _requirementRepository;
    private readonly IServiceRepository _serviceRepository;
    private readonly IStoredFileRepository _storedFileRepository;

    public GetApplicantRequirementsQueryHandler(
        IApplicationFullRepository applicationRepository,
        IRequirementRepository requirementRepository,
        IServiceRepository serviceRepository,
        IStoredFileRepository storedFileRepository)
    {
        _applicationRepository = applicationRepository;
        _requirementRepository = requirementRepository;
        _serviceRepository = serviceRepository;
        _storedFileRepository = storedFileRepository;
    }

    public async Task<ApiResponse<List<ApplicantRequirementItemDto>>> Handle(
        GetApplicantRequirementsQuery request,
        CancellationToken cancellationToken)
    {
        var app = await _applicationRepository.GetByIdWithDetailsAsync(request.ApplicationId, cancellationToken);
        if (app == null)
        {
            return ApiResponse<List<ApplicantRequirementItemDto>>.Fail($"Application '{request.ApplicationId}' was not found.");
        }

        var appApplicant = app.ApplicationApplicants.FirstOrDefault(aa => aa.ApplicantId == request.ApplicantId);
        if (appApplicant == null)
        {
            return ApiResponse<List<ApplicantRequirementItemDto>>.Fail($"Applicant '{request.ApplicantId}' was not linked to application '{request.ApplicationId}'.");
        }

        var applicant = appApplicant.Applicant;

        // Resolve ServiceId and ServiceVariantId for this applicant
        Guid? serviceId = applicant?.ServiceId;
        Guid? variantId = applicant?.ServiceVariantId;

        // Fallback to any applicant service if not explicitly specified on target applicant record
        if (!serviceId.HasValue)
        {
            var appWithService = app.ApplicationApplicants.FirstOrDefault(aa => aa.Applicant?.ServiceId != null);
            if (appWithService?.Applicant != null)
            {
                serviceId = appWithService.Applicant.ServiceId;
                if (!variantId.HasValue)
                {
                    variantId = appWithService.Applicant.ServiceVariantId;
                }
            }
        }

        List<ServiceVariantRequirement> rules = new();

        if (serviceId.HasValue && serviceId.Value != Guid.Empty)
        {
            rules = await _requirementRepository.GetServiceVariantRequirementsAsync(
                serviceId.Value,
                variantId,
                cancellationToken);
        }

        // Distinct rules by RequirementId, preferring explicit IsRequired = true
        var distinctRules = rules
            .GroupBy(svr => svr.RequirementId)
            .Select(g => g.OrderByDescending(x => x.IsRequired).First())
            .ToList();

        // Get submitted requirements for this applicant
        var applicantSubmissions = app.ApplicationRequirements
            .Where(ar => ar.ApplicantId == request.ApplicantId)
            .ToList();

        var resultList = new List<ApplicantRequirementItemDto>();
        var matchedSubmissionIds = new HashSet<Guid>();

        foreach (var rule in distinctRules)
        {
            var reqName = rule.Requirement?.Name ?? "Document Requirement";
            var reqDesc = rule.Requirement?.Description;

            var matchingSub = applicantSubmissions.FirstOrDefault(ar =>
                (ar.ServiceVariantRequirementId.HasValue && ar.ServiceVariantRequirementId == rule.Id) ||
                ar.RequirementId == rule.RequirementId);

            StoredFile? storedFile = null;
            if (matchingSub != null)
            {
                matchedSubmissionIds.Add(matchingSub.Id);
                if (matchingSub.StoredFile != null)
                {
                    storedFile = matchingSub.StoredFile;
                }
                else if (matchingSub.StoredFileId.HasValue)
                {
                    storedFile = await _storedFileRepository.GetByIdAsync(matchingSub.StoredFileId.Value, cancellationToken);
                }
            }

            string? fileName = storedFile?.FileName;
            if (string.IsNullOrEmpty(fileName) && matchingSub != null && !string.IsNullOrEmpty(matchingSub.Url))
            {
                fileName = Path.GetFileName(matchingSub.Url);
            }

            resultList.Add(new ApplicantRequirementItemDto
            {
                RequirementId = rule.RequirementId,
                ServiceVariantRequirementId = rule.Id,
                RequirementName = reqName,
                Description = reqDesc,
                IsRequired = rule.IsRequired,
                SubmittedRequirementId = matchingSub?.Id,
                StoredFileId = matchingSub?.StoredFileId ?? storedFile?.Id,
                FileName = fileName,
                ContentType = storedFile?.ContentType,
                FileSizeBytes = storedFile?.FileSizeBytes,
                Url = matchingSub?.Url,
                IsApproved = matchingSub?.IsApproved ?? false,
                UploadedAt = matchingSub?.CreatedAt
            });
        }

        // Include any extra submitted requirements that were not part of the active service rules
        foreach (var sub in applicantSubmissions.Where(s => !matchedSubmissionIds.Contains(s.Id)))
        {
            var reqMaster = sub.Requirement ?? await _requirementRepository.GetRequirementByIdAsync(sub.RequirementId, cancellationToken);
            StoredFile? storedFile = sub.StoredFile;
            if (storedFile == null && sub.StoredFileId.HasValue)
            {
                storedFile = await _storedFileRepository.GetByIdAsync(sub.StoredFileId.Value, cancellationToken);
            }

            string? fileName = storedFile?.FileName;
            if (string.IsNullOrEmpty(fileName) && !string.IsNullOrEmpty(sub.Url))
            {
                fileName = Path.GetFileName(sub.Url);
            }

            resultList.Add(new ApplicantRequirementItemDto
            {
                RequirementId = sub.RequirementId,
                ServiceVariantRequirementId = sub.ServiceVariantRequirementId,
                RequirementName = reqMaster?.Name ?? "Additional Document Attachment",
                Description = reqMaster?.Description,
                IsRequired = false,
                SubmittedRequirementId = sub.Id,
                StoredFileId = sub.StoredFileId ?? storedFile?.Id,
                FileName = fileName,
                ContentType = storedFile?.ContentType,
                FileSizeBytes = storedFile?.FileSizeBytes,
                Url = sub.Url,
                IsApproved = sub.IsApproved,
                UploadedAt = sub.CreatedAt
            });
        }

        return ApiResponse<List<ApplicantRequirementItemDto>>.Success(
            resultList,
            "Applicant service requirements retrieved successfully.");
    }
}
