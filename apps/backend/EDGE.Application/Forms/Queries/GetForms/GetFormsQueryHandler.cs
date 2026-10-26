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

namespace EDGE.Application.Forms.Queries.GetForms;

public class GetFormsQueryHandler : IRequestHandler<GetFormsQuery, PaginatedApiResponse<FormDto>>
{
    private readonly IFormRepository _formRepository;

    public GetFormsQueryHandler(IFormRepository formRepository)
    {
        _formRepository = formRepository;
    }

    public async Task<PaginatedApiResponse<FormDto>> Handle(GetFormsQuery request, CancellationToken cancellationToken)
    {
        var forms = await _formRepository.GetAllAsync(cancellationToken);

        if (request.ServiceId.HasValue && request.ServiceId.Value != Guid.Empty)
        {
            forms = forms.Where(f => f.ServiceId == request.ServiceId.Value).ToList();
        }

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var search = request.SearchTerm.Trim().ToLower();
            forms = forms.Where(f =>
                (f.Name != null && f.Name.ToLower().Contains(search)) ||
                (f.Version != null && f.Version.ToLower().Contains(search)) ||
                (f.Service != null && f.Service.Name != null && f.Service.Name.ToLower().Contains(search)) ||
                (f.Service != null && f.Service.Code != null && f.Service.Code.ToLower().Contains(search)) ||
                (f.Sections != null && f.Sections.Any(s =>
                    (s.Title != null && s.Title.ToLower().Contains(search)) ||
                    (s.Key != null && s.Key.ToLower().Contains(search)) ||
                    (s.SectionFields != null && s.SectionFields.Any(sf =>
                        sf.Field != null && sf.Field.Label != null && sf.Field.Label.ToLower().Contains(search)
                    ))
                ))
            ).ToList();
        }

        // Group by application type (ServiceId). Standalone forms without a service are grouped individually.
        var grouped = forms
            .GroupBy(f => f.ServiceId != Guid.Empty ? f.ServiceId.ToString() : f.Id.ToString())
            .Select(g =>
            {
                var allInGroup = g.OrderByDescending(f => f.IsActive).ThenByDescending(f => f.CreatedAt).ToList();
                var primary = allInGroup.FirstOrDefault(f => f.IsActive) ?? allInGroup.First();

                var versionSummaries = allInGroup.Select(v => new FormVersionSummaryDto
                {
                    FormId = v.Id,
                    Version = v.Version,
                    Name = v.Name,
                    IsActive = v.IsActive,
                    CreatedAt = v.CreatedAt,
                    UpdatedAt = v.LastModifiedAt,
                    SectionsCount = v.Sections?.Count(s => !s.IsDeleted) ?? 0,
                    FieldsCount = v.Sections?.Where(s => !s.IsDeleted).SelectMany(s => s.SectionFields ?? Enumerable.Empty<SectionField>()).Count() ?? 0
                }).ToList();

                return new FormDto
                {
                    FormId = primary.Id,
                    ServiceId = primary.ServiceId,
                    ServiceName = primary.Service?.Name,
                    ServiceCode = primary.Service?.Code,
                    Name = primary.Name,
                    Version = primary.Version,
                    IsActive = primary.IsActive,
                    CategorySelectionRequired = primary.CategorySelectionRequired,
                    CreatedAt = primary.CreatedAt,
                    UpdatedAt = primary.LastModifiedAt,
                    AvailableVersions = versionSummaries,
                    Sections = primary.Sections
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
            })
            .OrderByDescending(f => f.UpdatedAt ?? f.CreatedAt)
            .ToList();

        int totalCount = grouped.Count;
        int pageNumber = request.PageNumber.GetValueOrDefault(1);
        int pageSize = request.PageSize.GetValueOrDefault(50);
        if (pageNumber <= 0) pageNumber = 1;
        if (pageSize <= 0) pageSize = 50;

        var paginated = grouped
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        return new PaginatedApiResponse<FormDto>(paginated, pageNumber, pageSize, totalCount);
    }
}
