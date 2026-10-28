using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Application.Forms.Dtos;

namespace EDGE.Application.Forms.Commands.DuplicateForm;

public class DuplicateFormCommandHandler : IRequestHandler<DuplicateFormCommand, ApiResponse<FormDto>>
{
    private readonly IFormRepository _formRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DuplicateFormCommandHandler(IFormRepository formRepository, IUnitOfWork unitOfWork)
    {
        _formRepository = formRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<FormDto>> Handle(DuplicateFormCommand request, CancellationToken cancellationToken)
    {
        var sourceForm = await _formRepository.GetByIdAsync(request.Id, cancellationToken);
        if (sourceForm == null)
        {
            return ApiResponse<FormDto>.Fail($"Source form template with ID '{request.Id}' was not found.", ApiErrorCode.NotFound);
        }

        var newVersion = !string.IsNullOrWhiteSpace(request.Version)
            ? request.Version
            : $"{sourceForm.Version}-copy";

        var clonedForm = new Form
        {
            ServiceId = sourceForm.ServiceId,
            Key = !string.IsNullOrWhiteSpace(sourceForm.Key) ? $"{sourceForm.Key}-copy" : string.Empty,
            ServiceVariantId = sourceForm.ServiceVariantId,
            BaseFormId = sourceForm.BaseFormId ?? (sourceForm.ServiceVariantId == null ? sourceForm.Id : null),
            Name = !string.IsNullOrWhiteSpace(sourceForm.Name) ? $"{sourceForm.Name} (Copy)" : null,
            Version = newVersion,
            IsActive = false,
            CategorySelectionRequired = sourceForm.CategorySelectionRequired
        };

        foreach (var sourceSection in sourceForm.Sections)
        {
            var clonedSection = new FormSection
            {
                FormId = clonedForm.Id,
                Key = sourceSection.Key,
                Title = sourceSection.Title,
                OrderIndex = sourceSection.OrderIndex
            };

            foreach (var sourceField in sourceSection.SectionFields)
            {
                var clonedField = new Field
                {
                    Label = sourceField.Field?.Label ?? string.Empty,
                    FieldType = sourceField.Field?.FieldType ?? string.Empty,
                    ValidationRules = sourceField.Field?.ValidationRules,
                    IsOtherEnabled = sourceField.Field?.IsOtherEnabled ?? false,
                    SyncBackOnSubmit = sourceField.Field?.SyncBackOnSubmit ?? false
                };

                var clonedSectionField = new SectionField
                {
                    FormSectionId = clonedSection.Id,
                    Field = clonedField,
                    IsRequired = sourceField.IsRequired,
                    OrderIndex = sourceField.OrderIndex,
                    VisibilityCondition = sourceField.VisibilityCondition
                };

                clonedSection.SectionFields.Add(clonedSectionField);
            }

            clonedForm.Sections.Add(clonedSection);
        }

        await _formRepository.AddAsync(clonedForm, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var resultDto = new FormDto
        {
            FormId = clonedForm.Id,
            Key = clonedForm.Key,
            ServiceId = clonedForm.ServiceId,
            ServiceVariantId = clonedForm.ServiceVariantId,
            BaseFormId = clonedForm.BaseFormId,
            Name = clonedForm.Name,
            Version = clonedForm.Version,
            IsActive = clonedForm.IsActive,
            Sections = clonedForm.Sections.Select(s => new FormSectionDto
            {
                Key = s.Key,
                Title = s.Title,
                Required = true,
                OrderIndex = s.OrderIndex,
                Fields = s.SectionFields.Select(sf => new FormFieldDto
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

        return ApiResponse<FormDto>.Success(resultDto, "Form template duplicated successfully.");
    }
}
