using MediatR;
using System.Threading;
using System.Threading.Tasks;
using EDGE.Application.Elements.DTOs;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.Elements.Queries.GetElementById;

public class GetElementByIdQueryHandler : IRequestHandler<GetElementByIdQuery, ElementDto?>
{
    private readonly IElementRepository _elementRepository;

    public GetElementByIdQueryHandler(IElementRepository elementRepository)
    {
        _elementRepository = elementRepository;
    }

    public async Task<ElementDto?> Handle(GetElementByIdQuery request, CancellationToken cancellationToken)
    {
        var element = await _elementRepository.GetByIdAsync(request.Id, cancellationToken);
        if (element == null)
        {
            return null;
        }

        return new ElementDto(
            element.Id,
            element.Name,
            element.Code,
            element.Description,
            element.CreatedAt
        );
    }
}
