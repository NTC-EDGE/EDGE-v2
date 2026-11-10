using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Application.Forms.Dtos;

namespace EDGE.Application.Forms.Commands.SaveVariantForm;

public class SaveVariantFormCommandHandler : IRequestHandler<SaveVariantFormCommand, ApiResponse<FormDto>>
{
    private readonly IServiceVariantRepository _serviceVariantRepository;
    private readonly IFormRepository _formRepository;

    public SaveVariantFormCommandHandler(
        IServiceVariantRepository serviceVariantRepository,
        IFormRepository formRepository)
    {
        _serviceVariantRepository = serviceVariantRepository;
        _formRepository = formRepository;
    }

    public async Task<ApiResponse<FormDto>> Handle(SaveVariantFormCommand request, CancellationToken cancellationToken)
    {
        var variant = await _serviceVariantRepository.GetByIdAsync(request.VariantId, cancellationToken);
        if (variant == null)
        {
            return ApiResponse<FormDto>.Fail($"Service variant with ID {request.VariantId} was not found.");
        }

        // Find the Master Base Form for this service
        var baseForm = await _formRepository.GetFormByServiceIdAsync(variant.ServiceId, null, null, cancellationToken);

        // Check if a dedicated variant form already exists
        var existingVariantForm = await _formRepository.GetActiveVariantFormAsync(variant.Id, cancellationToken);

        var targetFormId = existingVariantForm?.Id ?? Guid.NewGuid();
        var formVersion = !string.IsNullOrWhiteSpace(request.Version)
            ? request.Version.Trim()
            : existingVariantForm?.Version ?? "1.0";

        var formName = !string.IsNullOrWhiteSpace(request.Name)
            ? request.Name.Trim()
            : existingVariantForm?.Name ?? $"{variant.Description ?? variant.Type.ToString()} Form";

        var formKey = !string.IsNullOrWhiteSpace(existingVariantForm?.Key)
            ? existingVariantForm.Key
            : $"var_{variant.Id}";

        var savedForm = await _formRepository.SaveFormStructureAsync(
            targetFormId,
            variant.ServiceId,
            formVersion,
            false,
            request.Sections ?? new List<FormSectionDto>(),
            formName,
            request.IsActive ?? true,
            formKey,
            variant.Id,
            baseForm?.Id,
            cancellationToken);

        var resultDto = new FormDto
        {
            FormId = savedForm.Id,
            Key = savedForm.Key,
            ServiceId = savedForm.ServiceId,
            ServiceName = savedForm.Service?.Name ?? variant.Service?.Name,
            ServiceCode = savedForm.Service?.Code ?? variant.Service?.Code,
            ServiceVariantId = savedForm.ServiceVariantId,
            ServiceVariantName = savedForm.ServiceVariant?.Description ?? variant.Description,
            BaseFormId = savedForm.BaseFormId,
            BaseFormKey = savedForm.BaseForm?.Key ?? baseForm?.Key,
            Name = savedForm.Name,
            Version = savedForm.Version,
            IsActive = savedForm.IsActive,
            CategorySelectionRequired = savedForm.CategorySelectionRequired,
            IsCustomized = true,
            CreatedAt = savedForm.CreatedAt,
            UpdatedAt = savedForm.LastModifiedAt,
            Sections = savedForm.Sections
                .Where(s => !s.IsDeleted)
                .OrderBy(s => s.OrderIndex)
                .Select(s => new FormSectionDto
                {
                    Key = s.Key,
                    Title = s.Title,
                    Required = true,
                    OrderIndex = s.OrderIndex,
                    Fields = s.SectionFields
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

        return ApiResponse<FormDto>.Success(resultDto, "Variant form customized and saved successfully.");
    }
}
