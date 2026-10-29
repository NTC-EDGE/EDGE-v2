using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Forms.Dtos;

namespace EDGE.Application.Forms.Commands.CreateForm;

public class CreateFormCommandHandler : IRequestHandler<CreateFormCommand, FormDto>
{
    private readonly IFormRepository _formRepository;

    public CreateFormCommandHandler(IFormRepository formRepository)
    {
        _formRepository = formRepository;
    }

    public async Task<FormDto> Handle(CreateFormCommand request, CancellationToken cancellationToken)
    {
        var formId = Guid.NewGuid();
        var form = await _formRepository.SaveFormStructureAsync(
            formId,
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

        return new FormDto
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
    }
}
