using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Forms.Dtos;

namespace EDGE.Application.Forms.Queries.GetForms;

public class GetFormsQueryHandler : IRequestHandler<GetFormsQuery, List<FormDto>>
{
    private readonly IFormRepository _formRepository;

    public GetFormsQueryHandler(IFormRepository formRepository)
    {
        _formRepository = formRepository;
    }

    public async Task<List<FormDto>> Handle(GetFormsQuery request, CancellationToken cancellationToken)
    {
        var forms = await _formRepository.GetAllAsync(cancellationToken);

        return forms.Select(f => new FormDto
        {
            FormId = f.Id,
            ServiceId = f.ServiceId,
            Version = f.Version,
            Sections = f.Sections.Select(s => new FormSectionDto
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
        }).ToList();
    }
}
