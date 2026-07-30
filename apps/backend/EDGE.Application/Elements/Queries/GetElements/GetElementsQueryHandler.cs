using MediatR;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using EDGE.Application.Elements.DTOs;
using EDGE.Application.Common.Interfaces;

using EDGE.Application.Common.Models;

namespace EDGE.Application.Elements.Queries.GetElements;

public class GetElementsQueryHandler : IRequestHandler<GetElementsQuery, PaginatedApiResponse<ElementDto>>
{
    private readonly IElementRepository _elementRepository;

    public GetElementsQueryHandler(IElementRepository elementRepository)
    {
        _elementRepository = elementRepository;
    }

    public async Task<PaginatedApiResponse<ElementDto>> Handle(GetElementsQuery request, CancellationToken cancellationToken)
    {
        var elements = await _elementRepository.GetAllAsync(cancellationToken);

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var search = request.SearchTerm.ToLower();
            elements = elements.Where(e => 
                e.Code.ToLower().Contains(search) || 
                e.Name.ToLower().Contains(search) || 
                (e.Description != null && e.Description.ToLower().Contains(search))
            ).ToList();
        }

        int totalCount = elements.Count;
        int pageNumber = request.PageNumber ?? 1;
        int pageSize = request.PageSize ?? 10;
        if (pageSize <= 0) pageSize = 1;

        var paginated = elements.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToList();

        var dtos = paginated.Select(e => new ElementDto(
            e.Id,
            e.Name,
            e.Code,
            e.Description,
            e.CreatedAt
        )).ToList();

        return new PaginatedApiResponse<ElementDto>(dtos, pageNumber, pageSize, totalCount);
    }
}
