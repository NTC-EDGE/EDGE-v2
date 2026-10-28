using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.Extensions.Logging;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Application.Forms.Dtos;
using EDGE.Application.Forms.Services;

namespace EDGE.Application.Forms.Queries.GetFormByServiceId;

public class GetFormByServiceIdQueryHandler : IRequestHandler<GetFormByServiceIdQuery, ApiResponse<FormDto>>
{
    private readonly IFormRepository _formRepository;
    private readonly IServiceRepository _serviceRepository;
    private readonly ContractFormValidator _contractValidator;
    private readonly ILogger<GetFormByServiceIdQueryHandler>? _logger;

    public GetFormByServiceIdQueryHandler(
        IFormRepository formRepository,
        IServiceRepository serviceRepository,
        ContractFormValidator contractValidator,
        ILogger<GetFormByServiceIdQueryHandler>? logger = null)
    {
        _formRepository = formRepository;
        _serviceRepository = serviceRepository;
        _contractValidator = contractValidator;
        _logger = logger;
    }

    public async Task<ApiResponse<FormDto>> Handle(GetFormByServiceIdQuery request, CancellationToken cancellationToken)
    {
        var service = await _serviceRepository.GetByIdAsync(request.ServiceId, cancellationToken);
        if (service == null)
        {
            return ApiResponse<FormDto>.Fail($"Service with ID {request.ServiceId} was not found.");
        }

        var form = await _formRepository.GetFormByServiceIdAsync(
            request.ServiceId,
            request.ServiceVariantId,
            request.FormKey,
            cancellationToken);

        if (form == null)
        {
            return ApiResponse<FormDto>.Fail($"Form layout for Service ID {request.ServiceId} was not found.");
        }

        // Step 4 — Run ContractFormValidator before returning.
        if (!string.IsNullOrWhiteSpace(service.Contract))
        {
            var validationResult = _contractValidator.Validate(service.Contract, form);
            if (!validationResult.IsValid)
            {
                _logger?.LogWarning(
                    "Form layout for Service ID {ServiceId} has contract discrepancies: {Errors}. Serving dynamic form schema directly.",
                    request.ServiceId,
                    string.Join("; ", validationResult.Errors));
            }
        }

        // Build the set of required section keys from the contract to populate
        // the `required` flag on each section DTO — used by the frontend.
        var requiredSectionKeys = !string.IsNullOrWhiteSpace(service.Contract)
            ? _contractValidator.GetRequiredSectionKeys(service.Contract)
            : new System.Collections.Generic.HashSet<string>();

        var allVersions = (await _formRepository.GetVersionsByServiceIdAsync(form.ServiceId, cancellationToken)) ?? new System.Collections.Generic.List<EDGE.Domain.Entities.Form>();
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
            ServiceVariantName = form.ServiceVariant?.Description,
            BaseFormId = form.BaseFormId,
            BaseFormKey = form.BaseForm?.Key,
            Name = form.Name,
            Version = form.Version,
            IsActive = form.IsActive,
            CategorySelectionRequired = form.CategorySelectionRequired,
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
