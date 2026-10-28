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

namespace EDGE.Application.Forms.Commands.UpdateForm;

public class UpdateFormCommandHandler : IRequestHandler<UpdateFormCommand, ApiResponse<FormDto>>
{
    private readonly IFormRepository _formRepository;

    public UpdateFormCommandHandler(IFormRepository formRepository)
    {
        _formRepository = formRepository;
    }

    public async Task<ApiResponse<FormDto>> Handle(UpdateFormCommand request, CancellationToken cancellationToken)
    {
        var form = await _formRepository.SaveFormStructureAsync(
            request.Id,
            request.ServiceId,
            request.Version,
            request.CategorySelectionRequired,
            request.Sections ?? new List<FormSectionDto>(),
            request.Name,
            request.IsActive,
            request.Key,
            request.ServiceVariantId,
            request.BaseFormId,
            cancellationToken);

        var resultDto = new FormDto
        {
            FormId = form.Id,
            Key = form.Key,
            ServiceId = form.ServiceId,
            ServiceName = form.Service?.Name,
            ServiceCode = form.Service?.Code,
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
            Sections = form.Sections
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

        return ApiResponse<FormDto>.Success(resultDto, "Form template updated successfully.");
    }
}
