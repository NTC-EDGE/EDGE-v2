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
using EDGE.Application.Forms.Services;

namespace EDGE.Application.Forms.Queries.GetForms;

public class GetFormsQueryHandler : IRequestHandler<GetFormsQuery, PaginatedApiResponse<FormDto>>
{
    private readonly IFormRepository _formRepository;
    private readonly ContractFormValidator _contractValidator;

    public GetFormsQueryHandler(
        IFormRepository formRepository,
        ContractFormValidator? contractValidator = null)
    {
        _formRepository = formRepository;
        _contractValidator = contractValidator ?? new ContractFormValidator();
    }

    public async Task<PaginatedApiResponse<FormDto>> Handle(GetFormsQuery request, CancellationToken cancellationToken)
    {
        var forms = await _formRepository.GetAllAsync(cancellationToken);

        if (request.ServiceId.HasValue && request.ServiceId.Value != Guid.Empty)
        {
            var resolvedCanonical = _formRepository.ResolveCanonicalServiceId(request.ServiceId.Value);
            var groupIds = _formRepository.GetCanonicalServiceGroupIds(request.ServiceId.Value);
            var targetServiceIds = new HashSet<Guid> { request.ServiceId.Value };
            if (resolvedCanonical != Guid.Empty) targetServiceIds.Add(resolvedCanonical);
            if (groupIds != null)
            {
                foreach (var gid in groupIds)
                {
                    if (gid != Guid.Empty) targetServiceIds.Add(gid);
                }
            }

            forms = forms.Where(f => targetServiceIds.Contains(f.ServiceId)).ToList();
        }

        if (request.ServiceCategoryId.HasValue && request.ServiceCategoryId.Value != Guid.Empty)
        {
            forms = forms.Where(f => f.Service != null && f.Service.ServiceCategoryId == request.ServiceCategoryId.Value).ToList();
        }

        if (request.ServiceVariantId.HasValue && request.ServiceVariantId.Value != Guid.Empty)
        {
            forms = forms.Where(f => f.ServiceVariantId == request.ServiceVariantId.Value).ToList();
        }
        else
        {
            // Canonical forms are shared base forms; exclude isolated variant rows
            forms = forms.Where(f => !f.ServiceVariantId.HasValue || f.ServiceVariantId.Value == Guid.Empty).ToList();
        }

        if (!string.IsNullOrWhiteSpace(request.FormKey))
        {
            var targetKey = request.FormKey.Trim().ToLowerInvariant();
            forms = forms.Where(f => f.Key != null && f.Key.ToLowerInvariant() == targetKey).ToList();
        }

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var search = request.SearchTerm.Trim().ToLower();
            forms = forms.Where(f =>
                (f.Name != null && f.Name.ToLower().Contains(search)) ||
                (f.Key != null && f.Key.ToLower().Contains(search)) ||
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

        // Group by canonical ServiceId (or standalone Form Id if not linked to a service).
        var grouped = forms
            .GroupBy(f => f.ServiceId != Guid.Empty ? $"{f.ServiceId}:base" : f.Id.ToString())
            .Select(g =>
            {
                var allInGroup = g.OrderByDescending(f => f.IsActive).ThenByDescending(f => f.CreatedAt).ToList();
                var primary = allInGroup.FirstOrDefault(f => f.IsActive) ?? allInGroup.First();

                var requiredSectionKeys = !string.IsNullOrWhiteSpace(primary.Service?.Contract)
                    ? _contractValidator.GetRequiredSectionKeys(primary.Service!.Contract)
                    : new HashSet<string>();

                bool seenActive = false;
                var versionSummaries = allInGroup.Select(v =>
                {
                    bool effectiveActive = v.IsActive && !seenActive;
                    if (effectiveActive) seenActive = true;
                    return new FormVersionSummaryDto
                    {
                        FormId = v.Id,
                        Key = v.Key,
                        ServiceVariantId = v.ServiceVariantId,
                        Version = v.Version,
                        Name = v.Name,
                        IsActive = effectiveActive,
                        CreatedAt = v.CreatedAt,
                        UpdatedAt = v.LastModifiedAt,
                        SectionsCount = v.Sections?.Count(s => !s.IsDeleted) ?? 0,
                        FieldsCount = v.Sections?.Where(s => !s.IsDeleted).SelectMany(s => s.SectionFields ?? Enumerable.Empty<SectionField>()).Count() ?? 0
                    };
                }).ToList();

                return new FormDto
                {
                    FormId = primary.Id,
                    Key = primary.Key,
                    ServiceId = primary.ServiceId,
                    ServiceName = primary.Service?.Name,
                    ServiceCode = primary.Service?.Code,
                    ServiceVariantId = primary.ServiceVariantId,
                    ServiceVariantName = primary.ServiceVariant?.Description,
                    BaseFormId = primary.BaseFormId,
                    BaseFormKey = primary.BaseForm?.Key,
                    Name = primary.Name,
                    Version = primary.Version,
                    IsActive = primary.IsActive,
                    CategorySelectionRequired = primary.CategorySelectionRequired,
                    IsCustomized = primary.ServiceVariantId.HasValue,
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
                            Required = requiredSectionKeys.Contains(s.Key),
                            OrderIndex = s.OrderIndex,
                            VisibilityCondition = FormSectionDto.ExtractSectionVisibilityCondition(s.SectionFields),
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
                                    VisibilityCondition = sf.VisibilityCondition,
                                    Options = FormFieldDto.ExtractOptions(sf.Field?.ValidationRules)
                                }).ToList()
                        }).ToList()
                };
            })
            .OrderByDescending(f => f.UpdatedAt ?? f.CreatedAt)
            .ToList();

        if (request.IsActive.HasValue)
        {
            grouped = grouped.Where(f => f.IsActive == request.IsActive.Value).ToList();
        }

        int totalCount = grouped.Count;
        int pageNumber = request.PageNumber ?? 1;
        int pageSize = request.PageSize ?? 50;
        if (pageNumber <= 0) pageNumber = 1;
        if (pageSize <= 0) pageSize = 50;

        var paginated = grouped
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        var pageServiceIds = paginated
            .Where(i => i.ServiceId != Guid.Empty)
            .Select(i => i.ServiceId)
            .Distinct()
            .ToList();

        if (pageServiceIds.Count > 0)
        {
            var batchMeta = await _formRepository.GetBatchVariantMetadataForServicesAsync(pageServiceIds, cancellationToken);
            if (batchMeta != null)
            {
                foreach (var item in paginated)
                {
                    if (item.ServiceId != Guid.Empty && batchMeta.TryGetValue(item.ServiceId, out var meta))
                    {
                        item.LinkedVariantsCount = meta.LinkedVariantsCount;
                        item.CustomizedVariantIds = meta.CustomizedVariantIds;
                    }
                }
            }
        }

        return new PaginatedApiResponse<FormDto>(
            paginated,
            pageNumber,
            pageSize,
            totalCount,
            "Forms retrieved successfully.");
    }
}
