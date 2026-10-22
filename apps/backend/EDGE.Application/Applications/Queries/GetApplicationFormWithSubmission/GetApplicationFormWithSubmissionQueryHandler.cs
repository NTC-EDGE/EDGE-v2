using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Application.Applications.Dtos;
using EDGE.Application.Forms.Services;

namespace EDGE.Application.Applications.Queries.GetApplicationFormWithSubmission;

public class GetApplicationFormWithSubmissionQueryHandler : IRequestHandler<GetApplicationFormWithSubmissionQuery, ApiResponse<ApplicationFormSubmissionDto>>
{
    private readonly IApplicationFullRepository _applicationRepository;
    private readonly IFormRepository _formRepository;
    private readonly IServiceRepository _serviceRepository;
    private readonly ContractFormValidator _contractValidator;

    public GetApplicationFormWithSubmissionQueryHandler(
        IApplicationFullRepository applicationRepository,
        IFormRepository formRepository,
        IServiceRepository serviceRepository,
        ContractFormValidator contractValidator)
    {
        _applicationRepository = applicationRepository;
        _formRepository = formRepository;
        _serviceRepository = serviceRepository;
        _contractValidator = contractValidator;
    }

    public async Task<ApiResponse<ApplicationFormSubmissionDto>> Handle(GetApplicationFormWithSubmissionQuery request, CancellationToken cancellationToken)
    {
        var app = await _applicationRepository.GetByIdWithDetailsAsync(request.ApplicationId, cancellationToken);
        if (app == null)
        {
            return ApiResponse<ApplicationFormSubmissionDto>.Fail($"Application with ID {request.ApplicationId} was not found.");
        }

        FormSubmission? submission = null;
        Applicant? applicant = null;

        // 1. Resolve via explicit SubmissionId if provided
        if (request.SubmissionId.HasValue && request.SubmissionId.Value != Guid.Empty)
        {
            submission = app.FormSubmissions.FirstOrDefault(fs => fs.Id == request.SubmissionId.Value);
            if (submission != null)
            {
                applicant = app.ApplicationApplicants.FirstOrDefault(aa => aa.ApplicantId == submission.ApplicantId)?.Applicant;
            }
        }

        // 2. Resolve via explicit ApplicantId if provided
        if (applicant == null && request.ApplicantId.HasValue && request.ApplicantId.Value != Guid.Empty)
        {
            applicant = app.ApplicationApplicants.FirstOrDefault(aa => aa.ApplicantId == request.ApplicantId.Value)?.Applicant;
            if (submission == null)
            {
                submission = applicant?.FormSubmission ?? app.FormSubmissions.FirstOrDefault(fs => fs.ApplicantId == request.ApplicantId.Value);
            }
        }

        // 3. Default fallbacks
        applicant ??= app.ApplicationApplicants.Select(aa => aa.Applicant).FirstOrDefault(a => a != null);
        if (applicant == null || !applicant.ServiceId.HasValue)
        {
            return ApiResponse<ApplicationFormSubmissionDto>.Fail($"Application {request.ApplicationId} has no associated service catalog item.");
        }

        submission ??= applicant.FormSubmission ?? app.FormSubmissions.FirstOrDefault();

        var serviceId = applicant.ServiceId.Value;
        var service = await _serviceRepository.GetByIdAsync(serviceId, cancellationToken);
        var form = await _formRepository.GetFormByServiceIdAsync(serviceId, cancellationToken);

        if (form == null && submission != null && submission.FormId != Guid.Empty)
        {
            form = await _formRepository.GetByIdAsync(submission.FormId, cancellationToken);
        }

        if (form == null)
        {
            var allForms = await _formRepository.GetAllAsync(cancellationToken);
            form = allForms.FirstOrDefault();
        }

        if (form == null)
        {
            return ApiResponse<ApplicationFormSubmissionDto>.Fail($"Form layout for Service ID {serviceId} was not found.");
        }

        if (submission == null)
        {
            if (app.FormSubmissions.Count == 1)
            {
                submission = app.FormSubmissions.First();
            }
            else
            {
                submission = app.FormSubmissions.FirstOrDefault(fs => fs.FormId == form.Id && fs.ApplicantId == Guid.Empty);
            }
        }

        var valueMap = submission?.FieldValues
            .GroupBy(fv => fv.FieldId)
            .ToDictionary(g => g.Key, g => g.First().Value)
            ?? new Dictionary<Guid, string>();

        var requiredSectionKeys = service != null && !string.IsNullOrWhiteSpace(service.Contract)
            ? _contractValidator.GetRequiredSectionKeys(service.Contract)
            : new HashSet<string>();

        var dto = new ApplicationFormSubmissionDto
        {
            SubmissionId = submission?.Id,
            FormId = form.Id,
            ServiceId = form.ServiceId,
            ApplicationId = app.Id,
            ApplicantId = submission?.ApplicantId,
            Version = form.Version,
            Sections = form.Sections
                .OrderBy(s => s.OrderIndex)
                .Select(fs => new ApplicationFormSectionDto
                {
                    Key = fs.Key,
                    Title = fs.Title,
                    Required = requiredSectionKeys.Contains(fs.Key),
                    OrderIndex = fs.OrderIndex,
                    Fields = fs.SectionFields
                        .OrderBy(sf => sf.OrderIndex)
                        .Select(sf => new ApplicationFormFieldValueDto
                        {
                            FieldId = sf.FieldId,
                            Label = sf.Field?.Label ?? string.Empty,
                            Type = sf.Field?.FieldType ?? string.Empty,
                            IsRequired = sf.IsRequired,
                            OrderIndex = sf.OrderIndex,
                            ValidationRules = sf.Field?.ValidationRules,
                            VisibilityCondition = sf.VisibilityCondition,
                            Value = valueMap.TryGetValue(sf.FieldId, out var val) ? val : null
                        }).ToList()
                }).ToList()
        };

        return ApiResponse<ApplicationFormSubmissionDto>.Success(dto);
    }
}
