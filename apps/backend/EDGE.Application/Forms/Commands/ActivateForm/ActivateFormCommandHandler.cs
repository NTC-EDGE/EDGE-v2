using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Application.Forms.Dtos;

namespace EDGE.Application.Forms.Commands.ActivateForm;

public class ActivateFormCommandHandler : IRequestHandler<ActivateFormCommand, ApiResponse<FormDto>>
{
    private readonly IFormRepository _formRepository;

    public ActivateFormCommandHandler(IFormRepository formRepository)
    {
        _formRepository = formRepository;
    }

    public async Task<ApiResponse<FormDto>> Handle(ActivateFormCommand request, CancellationToken cancellationToken)
    {
        var form = await _formRepository.SetFormActiveAsync(request.Id, cancellationToken);
        if (form == null)
        {
            return ApiResponse<FormDto>.Fail($"Form template with ID '{request.Id}' was not found.", ApiErrorCode.NotFound);
        }

        var versionSummaries = new System.Collections.Generic.List<FormVersionSummaryDto>();
        if (form.ServiceId != Guid.Empty)
        {
            var allVersions = (await _formRepository.GetVersionsByServiceIdAsync(form.ServiceId, cancellationToken)) ?? new System.Collections.Generic.List<EDGE.Domain.Entities.Form>();
            versionSummaries = allVersions.Select(v => new FormVersionSummaryDto
            {
                FormId = v.Id,
                Version = v.Version,
                Name = v.Name,
                IsActive = v.IsActive,
                CreatedAt = v.CreatedAt,
                UpdatedAt = v.LastModifiedAt,
                SectionsCount = v.Sections?.Count(s => !s.IsDeleted) ?? 0,
                FieldsCount = v.Sections?.Where(s => !s.IsDeleted).SelectMany(s => s.SectionFields ?? Enumerable.Empty<EDGE.Domain.Entities.SectionField>()).Count() ?? 0
            }).ToList();
        }

        var resultDto = new FormDto
        {
            FormId = form.Id,
            ServiceId = form.ServiceId,
            ServiceName = form.Service?.Name,
            ServiceCode = form.Service?.Code,
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

        return ApiResponse<FormDto>.Success(resultDto, $"Form template '{form.Name ?? form.Version}' is now the active form for this service.");
    }
}
