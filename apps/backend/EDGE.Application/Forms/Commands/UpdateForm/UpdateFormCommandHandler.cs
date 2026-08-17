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
    private readonly IUnitOfWork _unitOfWork;

    public UpdateFormCommandHandler(IFormRepository formRepository, IUnitOfWork unitOfWork)
    {
        _formRepository = formRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<FormDto>> Handle(UpdateFormCommand request, CancellationToken cancellationToken)
    {
        var form = await _formRepository.GetByIdAsync(request.Id, cancellationToken);
        if (form == null)
        {
            return ApiResponse<FormDto>.Fail($"Form template with ID '{request.Id}' was not found.", ApiErrorCode.NotFound);
        }

        form.ServiceId = request.ServiceId;
        form.Version = request.Version;
        form.CategorySelectionRequired = request.CategorySelectionRequired;
        form.LastModifiedAt = DateTime.UtcNow;

        var incomingSections = request.Sections ?? new List<FormSectionDto>();
        var incomingKeys = incomingSections
            .Where(s => !string.IsNullOrWhiteSpace(s.Key))
            .Select(s => s.Key)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        // 1. Remove sections not in incoming request
        var sectionsToRemove = form.Sections
            .Where(s => !incomingKeys.Contains(s.Key))
            .ToList();

        foreach (var s in sectionsToRemove)
        {
            form.Sections.Remove(s);
        }

        // 2. Synchronize sections
        foreach (var sectionDto in incomingSections)
        {
            var section = form.Sections.FirstOrDefault(s => string.Equals(s.Key, sectionDto.Key, StringComparison.OrdinalIgnoreCase));
            if (section == null)
            {
                section = new FormSection
                {
                    FormId = form.Id,
                    Key = sectionDto.Key,
                    Title = sectionDto.Title,
                    OrderIndex = sectionDto.OrderIndex
                };
                form.Sections.Add(section);
            }
            else
            {
                section.Title = sectionDto.Title;
                section.OrderIndex = sectionDto.OrderIndex;
                section.LastModifiedAt = DateTime.UtcNow;
            }

            var incomingFields = sectionDto.Fields ?? new List<FormFieldDto>();
            var incomingFieldIds = incomingFields
                .Where(f => f.FieldId != Guid.Empty)
                .Select(f => f.FieldId)
                .ToHashSet();

            // Remove section fields not in incoming section
            var sectionFieldsToRemove = section.SectionFields
                .Where(sf => !incomingFieldIds.Contains(sf.FieldId))
                .ToList();

            foreach (var sf in sectionFieldsToRemove)
            {
                section.SectionFields.Remove(sf);
            }

            // Update existing or add new section fields
            foreach (var fieldDto in incomingFields)
            {
                var existingSf = section.SectionFields.FirstOrDefault(sf => sf.FieldId == fieldDto.FieldId && fieldDto.FieldId != Guid.Empty);
                if (existingSf != null)
                {
                    existingSf.IsRequired = fieldDto.IsRequired;
                    existingSf.OrderIndex = fieldDto.OrderIndex;
                    existingSf.VisibilityCondition = fieldDto.VisibilityCondition;

                    if (existingSf.Field != null)
                    {
                        existingSf.Field.Label = fieldDto.Label;
                        existingSf.Field.FieldType = fieldDto.Type;
                        existingSf.Field.ValidationRules = fieldDto.ValidationRules;
                    }
                }
                else
                {
                    var newField = new Field
                    {
                        Label = fieldDto.Label,
                        FieldType = fieldDto.Type,
                        ValidationRules = fieldDto.ValidationRules
                    };

                    if (fieldDto.FieldId != Guid.Empty)
                    {
                        newField.Id = fieldDto.FieldId;
                    }

                    var newSectionField = new SectionField
                    {
                        FormSectionId = section.Id,
                        Field = newField,
                        FieldId = newField.Id,
                        IsRequired = fieldDto.IsRequired,
                        OrderIndex = fieldDto.OrderIndex,
                        VisibilityCondition = fieldDto.VisibilityCondition
                    };

                    section.SectionFields.Add(newSectionField);
                }
            }
        }

        _formRepository.Update(form);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var resultDto = new FormDto
        {
            FormId = form.Id,
            ServiceId = form.ServiceId,
            ServiceName = form.Service?.Name,
            ServiceCode = form.Service?.Code,
            Version = form.Version,
            CategorySelectionRequired = form.CategorySelectionRequired,
            CreatedAt = form.CreatedAt,
            UpdatedAt = form.LastModifiedAt,
            Sections = form.Sections
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
