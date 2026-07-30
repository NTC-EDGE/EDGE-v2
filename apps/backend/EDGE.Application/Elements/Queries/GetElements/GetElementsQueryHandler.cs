using MediatR;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using EDGE.Application.Elements.DTOs;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.Elements.Queries.GetElements;

public class GetElementsQueryHandler : IRequestHandler<GetElementsQuery, List<ElementDto>>
{
    private readonly IElementRepository _elementRepository;

    public GetElementsQueryHandler(IElementRepository elementRepository)
    {
        _elementRepository = elementRepository;
    }

    public async Task<List<ElementDto>> Handle(GetElementsQuery request, CancellationToken cancellationToken)
    {
        var elements = await _elementRepository.GetAllAsync(cancellationToken);
        return elements.Select(e => new ElementDto(
            e.Id,
            e.Name,
            e.Code,
            e.Description,
            e.CreatedAt
        )).ToList();
    }
}
