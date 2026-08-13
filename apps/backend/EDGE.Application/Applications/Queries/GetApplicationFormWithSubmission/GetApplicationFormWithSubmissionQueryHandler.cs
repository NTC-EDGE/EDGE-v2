using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Application.Forms.Dtos;
using EDGE.Application.Forms.Services;

namespace EDGE.Application.Applications.Queries.GetApplicationFormWithSubmission;

public class GetApplicationFormWithSubmissionQueryHandler : IRequestHandler<GetApplicationFormWithSubmissionQuery, ApiResponse<FormDto>>
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

    public async Task<ApiResponse<FormDto>> Handle(GetApplicationFormWithSubmissionQuery request, CancellationToken cancellationToken)
    {
        var app = await _applicationRepository.GetByIdWithDetailsAsync(request.ApplicationId, cancellationToken);
        if (app == null)
        {
            return ApiResponse<FormDto>.Fail($"Application with ID {request.ApplicationId} was not found.");
        }

        var appService = app.ApplicationServices.FirstOrDefault();
        if (appService == null)
        {
            return ApiResponse<FormDto>.Fail($"Application {request.ApplicationId} has no associated service catalog item.");
        }

        if (!appService.ServiceId.HasValue)
        {
            return ApiResponse<FormDto>.Fail($"Application {request.ApplicationId} has no associated service catalog item.");
        }

        var serviceId = appService.ServiceId.Value;
        var service = await _serviceRepository.GetByIdAsync(serviceId, cancellationToken);
        var form = await _formRepository.GetFormByServiceIdAsync(serviceId, cancellationToken);

        if (form == null)
        {
            return ApiResponse<FormDto>.Fail($"Form layout for Service ID {serviceId} was not found.");
        }

        FormSubmission? submission = null;
        if (request.ApplicantId.HasValue)
        {
            submission = app.FormSubmissions.FirstOrDefault(fs => fs.ApplicantId == request.ApplicantId.Value);
        }
        submission ??= app.FormSubmissions.FirstOrDefault();

        var valueMap = submission?.FieldValues
            .GroupBy(fv => fv.FieldId)
            .ToDictionary(g => g.Key, g => g.First().Value)
            ?? new Dictionary<Guid, string?>();

        var requiredSectionKeys = service != null && !string.IsNullOrWhiteSpace(service.Contract)
            ? _contractValidator.GetRequiredSectionKeys(service.Contract)
            : new HashSet<string>();

        var dto = new FormDto
        {
            FormId = form.Id,
            ServiceId = form.ServiceId,
            ApplicationId = app.Id,
            ApplicantId = submission?.ApplicantId,
            Version = form.Version,
            Sections = form.Sections
                .OrderBy(s => s.OrderIndex)
                .Select(fs => new FormSectionDto
                {
                    Key = fs.Key,
                    Title = fs.Title,
                    Required = requiredSectionKeys.Contains(fs.Key),
                    OrderIndex = fs.OrderIndex,
                    Fields = fs.SectionFields
                        .OrderBy(sf => sf.OrderIndex)
                        .Select(sf => new FormFieldDto
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

        return ApiResponse<FormDto>.Success(dto);
    }
}
