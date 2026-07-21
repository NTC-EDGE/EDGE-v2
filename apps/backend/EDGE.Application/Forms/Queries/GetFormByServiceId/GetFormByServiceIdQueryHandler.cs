using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Application.Forms.Dtos;

namespace EDGE.Application.Forms.Queries.GetFormByServiceId;

public class GetFormByServiceIdQueryHandler : IRequestHandler<GetFormByServiceIdQuery, ApiResponse<FormDto>>
{
    private readonly IFormRepository _formRepository;

    public GetFormByServiceIdQueryHandler(IFormRepository formRepository)
    {
        _formRepository = formRepository;
    }

    public async Task<ApiResponse<FormDto>> Handle(GetFormByServiceIdQuery request, CancellationToken cancellationToken)
    {
        var form = await _formRepository.GetFormByServiceIdAsync(request.ServiceId, cancellationToken);
        if (form == null)
        {
            return ApiResponse<FormDto>.Fail($"Form layout for Service ID {request.ServiceId} was not found.");
        }

        var dto = new FormDto
        {
            Id = form.Id,
            ServiceId = form.ServiceId,
            Version = form.Version,
            CategorySelectionRequired = form.CategorySelectionRequired,
            Sections = form.Sections.Select(fs => new FormSectionDto
            {
                Id = fs.Id,
                FormId = fs.FormId,
                Key = fs.Key,
                Title = fs.Title,
                OrderIndex = fs.OrderIndex,
                Fields = fs.SectionFields.Select(sf => new FormFieldDto
                {
                    Id = sf.FieldId,
                    FieldType = sf.Field?.FieldType ?? string.Empty,
                    Label = sf.Field?.Label ?? string.Empty,
                    ValidationRules = sf.Field?.ValidationRules,
                    IsRequired = sf.IsRequired,
                    OrderIndex = sf.OrderIndex,
                    VisibilityCondition = sf.VisibilityCondition,
                    SyncBackOnSubmit = sf.Field?.SyncBackOnSubmit ?? false
                }).ToList()
            }).ToList()
        };

        return ApiResponse<FormDto>.Success(dto);
    }
}
