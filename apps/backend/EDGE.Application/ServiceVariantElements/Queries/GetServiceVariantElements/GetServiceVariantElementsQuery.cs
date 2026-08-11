using MediatR;
using FluentValidation;
using EDGE.Application.ServiceVariantElements.DTOs;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace EDGE.Application.ServiceVariantElements.Queries.GetServiceVariantElements;

public record GetServiceVariantElementsQuery(
    Guid? ServiceId = null,
    Guid? ServiceVariantId = null,
    int? PageNumber = 1,
    int? PageSize = 10,
    string? SearchTerm = null
) : IRequest<PaginatedApiResponse<ServiceVariantElementDto>>;

public class GetServiceVariantElementsQueryHandler
    : IRequestHandler<GetServiceVariantElementsQuery, PaginatedApiResponse<ServiceVariantElementDto>>
{
    private readonly IServiceVariantElementRepository _elementRepository;

    public GetServiceVariantElementsQueryHandler(IServiceVariantElementRepository elementRepository)
    {
        _elementRepository = elementRepository;
    }

    public async Task<PaginatedApiResponse<ServiceVariantElementDto>> Handle(
        GetServiceVariantElementsQuery request,
        CancellationToken cancellationToken)
    {
        var elements = await _elementRepository.GetAllAsync(
            request.ServiceId,
            request.ServiceVariantId,
            cancellationToken);

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var search = request.SearchTerm.ToLower();
            elements = elements.Where(e =>
                e.Code.ToLower().Contains(search) ||
                (e.Description != null && e.Description.ToLower().Contains(search)) ||
                (e.ServiceVariant != null && e.ServiceVariant.Description != null && e.ServiceVariant.Description.ToLower().Contains(search)) ||
                (e.ServiceVariant != null && e.ServiceVariant.Service != null && e.ServiceVariant.Service.Name.ToLower().Contains(search))
            ).ToList();
        }

        int totalCount = elements.Count;
        int pageNumber = request.PageNumber ?? 1;
        int pageSize = request.PageSize ?? 10;
        if (pageSize <= 0) pageSize = 1;

        var paginated = elements.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToList();

        var dtos = paginated.Select(e => new ServiceVariantElementDto(
            e.Id,
            e.ServiceVariantId,
            e.ServiceVariant?.Description,
            e.Code,
            e.Description,
            e.CreatedAt
        )).ToList();

        return new PaginatedApiResponse<ServiceVariantElementDto>(dtos, pageNumber, pageSize, totalCount);
    }
}

public class GetServiceVariantElementsQueryValidator
    : FluentValidation.AbstractValidator<GetServiceVariantElementsQuery>
{
    public GetServiceVariantElementsQueryValidator()
    {
    }
}
