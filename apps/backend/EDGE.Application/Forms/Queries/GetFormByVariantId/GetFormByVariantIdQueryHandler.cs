using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.Extensions.Logging;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Application.Forms.Dtos;
using EDGE.Application.Forms.Services;

namespace EDGE.Application.Forms.Queries.GetFormByVariantId;

public class GetFormByVariantIdQueryHandler : IRequestHandler<GetFormByVariantIdQuery, ApiResponse<FormDto>>
{
    private readonly IServiceVariantRepository _serviceVariantRepository;
    private readonly IFormRepository _formRepository;
    private readonly IServiceRepository _serviceRepository;
    private readonly ContractFormValidator _contractValidator;
    private readonly ILogger<GetFormByVariantIdQueryHandler>? _logger;

    public GetFormByVariantIdQueryHandler(
        IServiceVariantRepository serviceVariantRepository,
        IFormRepository formRepository,
        IServiceRepository serviceRepository,
        ContractFormValidator contractValidator,
        ILogger<GetFormByVariantIdQueryHandler>? logger = null)
    {
        _serviceVariantRepository = serviceVariantRepository;
        _formRepository = formRepository;
        _serviceRepository = serviceRepository;
        _contractValidator = contractValidator;
        _logger = logger;
    }

    public async Task<ApiResponse<FormDto>> Handle(GetFormByVariantIdQuery request, CancellationToken cancellationToken)
    {
        var variant = await _serviceVariantRepository.GetByIdAsync(request.VariantId, cancellationToken);
        if (variant == null)
        {
            return ApiResponse<FormDto>.Fail($"Service variant with ID {request.VariantId} was not found.");
        }

        var service = await _serviceRepository.GetByIdAsync(variant.ServiceId, cancellationToken);
        if (service == null)
        {
            return ApiResponse<FormDto>.Fail($"Service with ID {variant.ServiceId} was not found.");
        }

        var form = await _formRepository.GetFormByServiceIdAsync(
            variant.ServiceId,
            variant.Id,
            null,
            cancellationToken);

        if (form == null)
        {
            return ApiResponse<FormDto>.Fail($"Form template for service variant {request.VariantId} was not found.");
        }

        bool isCustomized = form.ServiceVariantId.HasValue && form.ServiceVariantId.Value == variant.Id;

        var requiredSectionKeys = !string.IsNullOrWhiteSpace(service.Contract)
            ? _contractValidator.GetRequiredSectionKeys(service.Contract)
            : new System.Collections.Generic.HashSet<string>();

        var allVersions = (await _formRepository.GetVersionsByServiceIdAsync(form.ServiceId, cancellationToken))
            ?? new System.Collections.Generic.List<EDGE.Domain.Entities.Form>();

        var versionSummaries = allVersions
            .Where(v => v.ServiceVariantId == form.ServiceVariantId)
            .Select(v => new FormVersionSummaryDto
            {
                FormId = v.Id,
                Key = v.Key,
                ServiceVariantId = v.ServiceVariantId,
                Version = v.Version,
                Name = v.Name,
                IsActive = v.IsActive,
                CreatedAt = v.CreatedAt,
                UpdatedAt = v.LastModifiedAt,
                SectionsCount = v.Sections?.Count(s => !s.IsDeleted) ?? 0,
                FieldsCount = v.Sections?.Where(s => !s.IsDeleted).SelectMany(s => s.SectionFields ?? Enumerable.Empty<EDGE.Domain.Entities.SectionField>()).Count() ?? 0
            }).ToList();

        var dto = new FormDto
        {
            FormId = form.Id,
            Key = form.Key,
            ServiceId = form.ServiceId,
            ServiceName = form.Service?.Name ?? service.Name,
            ServiceCode = form.Service?.Code ?? service.Code,
            ServiceVariantId = form.ServiceVariantId,
            ServiceVariantName = form.ServiceVariant?.Description ?? variant.Description,
            BaseFormId = form.BaseFormId,
            BaseFormKey = form.BaseForm?.Key,
            Name = form.Name,
            Version = form.Version,
            IsActive = form.IsActive,
            CategorySelectionRequired = form.CategorySelectionRequired,
            IsCustomized = isCustomized,
            CreatedAt = form.CreatedAt,
            UpdatedAt = form.LastModifiedAt,
            AvailableVersions = versionSummaries,
            Sections = form.Sections
                .Where(s => !s.IsDeleted)
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
                            VisibilityCondition = sf.VisibilityCondition
                        }).ToList()
                }).ToList()
        };

        return ApiResponse<FormDto>.Success(dto);
    }
}
