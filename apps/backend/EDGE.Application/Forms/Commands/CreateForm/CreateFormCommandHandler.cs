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
    private readonly IUnitOfWork _unitOfWork;

    public CreateFormCommandHandler(IFormRepository formRepository, IUnitOfWork unitOfWork)
    {
        _formRepository = formRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<FormDto> Handle(CreateFormCommand request, CancellationToken cancellationToken)
    {
        var form = new Form
        {
            ServiceId = request.ServiceId,
            Version = request.Version,
            CategorySelectionRequired = request.CategorySelectionRequired
        };

        if (request.Sections != null && request.Sections.Count > 0)
        {
            foreach (var sectionDto in request.Sections)
            {
                var section = new FormSection
                {
                    FormId = form.Id,
                    Key = sectionDto.Key,
                    Title = sectionDto.Title,
                    OrderIndex = sectionDto.OrderIndex
                };

                if (sectionDto.Fields != null)
                {
                    foreach (var fieldDto in sectionDto.Fields)
                    {
                        var field = new Field
                        {
                            Label = fieldDto.Label,
                            FieldType = fieldDto.Type,
                            ValidationRules = fieldDto.ValidationRules
                        };

                        var sectionField = new SectionField
                        {
                            FormSectionId = section.Id,
                            Field = field,
                            IsRequired = fieldDto.IsRequired,
                            OrderIndex = fieldDto.OrderIndex,
                            VisibilityCondition = fieldDto.VisibilityCondition
                        };

                        section.SectionFields.Add(sectionField);
                    }
                }

                form.Sections.Add(section);
            }
        }

        await _formRepository.AddAsync(form, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new FormDto
        {
            FormId = form.Id,
            ServiceId = form.ServiceId,
            Version = form.Version,
            Sections = form.Sections.Select(s => new FormSectionDto
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
    }
}
