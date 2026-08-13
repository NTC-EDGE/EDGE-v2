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

namespace EDGE.Application.Applications.Queries.GetApplicantServiceFormSubmission;

public class GetApplicantServiceFormSubmissionQueryHandler : IRequestHandler<GetApplicantServiceFormSubmissionQuery, ApiResponse<ApplicationFormSubmissionDto>>
{
    private readonly IApplicationFullRepository _applicationRepository;
    private readonly IFormRepository _formRepository;
    private readonly IServiceRepository _serviceRepository;
    private readonly ContractFormValidator _contractValidator;

    public GetApplicantServiceFormSubmissionQueryHandler(
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

    public async Task<ApiResponse<ApplicationFormSubmissionDto>> Handle(GetApplicantServiceFormSubmissionQuery request, CancellationToken cancellationToken)
    {
        var app = await _applicationRepository.GetByIdWithDetailsAsync(request.ApplicationId, cancellationToken);
        if (app == null)
        {
            return ApiResponse<ApplicationFormSubmissionDto>.Fail($"Application with ID '{request.ApplicationId}' was not found.");
        }

        // 1. Locate specified Applicant
        var appApplicant = app.ApplicationApplicants.FirstOrDefault(aa => aa.ApplicantId == request.ApplicantId);
        var applicant = appApplicant?.Applicant;

        if (applicant == null || !applicant.ServiceId.HasValue)
        {
            return ApiResponse<ApplicationFormSubmissionDto>.Fail($"Applicant '{request.ApplicantId}' was not found under Application '{request.ApplicationId}'.");
        }

        var serviceId = applicant.ServiceId.Value;
        var service = await _serviceRepository.GetByIdAsync(serviceId, cancellationToken);

        // 2. Locate exact FormSubmission for this Applicant
        var submission = applicant.FormSubmission
            ?? app.FormSubmissions.FirstOrDefault(fs => fs.ApplicantId == request.ApplicantId);

        // 3. Resolve Form layout schema
        Form? form = null;
        if (submission != null && submission.FormId != Guid.Empty)
        {
            form = await _formRepository.GetByIdAsync(submission.FormId, cancellationToken);
        }

        form ??= await _formRepository.GetFormByServiceIdAsync(serviceId, cancellationToken);

        if (form == null)
        {
            return ApiResponse<ApplicationFormSubmissionDto>.Fail($"Form layout schema for Service ID '{serviceId}' was not found.");
        }

        var valueMap = submission?.FieldValues
            .GroupBy(fv => fv.FieldId)
            .ToDictionary(g => g.Key, g => g.First().Value)
            ?? new Dictionary<Guid, string?>();

        var requiredSectionKeys = service != null && !string.IsNullOrWhiteSpace(service.Contract)
            ? _contractValidator.GetRequiredSectionKeys(service.Contract)
            : new HashSet<string>();

        var dto = new ApplicationFormSubmissionDto
        {
            SubmissionId = submission?.Id,
            FormId = form.Id,
            ServiceId = form.ServiceId,
            ApplicationId = app.Id,
            ApplicantId = request.ApplicantId,
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
