using MediatR;
using FluentValidation;
using EDGE.Application.ServiceVariantElements.DTOs;
using EDGE.Application.Common.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace EDGE.Application.ServiceVariantElements.Queries.GetServiceVariantElements;

public record GetServiceVariantElementsQuery(Guid ServiceVariantId)
    : IRequest<List<ServiceVariantElementDto>>;

public class GetServiceVariantElementsQueryHandler
    : IRequestHandler<GetServiceVariantElementsQuery, List<ServiceVariantElementDto>>
{
    private readonly IServiceVariantElementRepository _elementRepository;

    public GetServiceVariantElementsQueryHandler(IServiceVariantElementRepository elementRepository)
    {
        _elementRepository = elementRepository;
    }

    public async Task<List<ServiceVariantElementDto>> Handle(
        GetServiceVariantElementsQuery request,
        CancellationToken cancellationToken)
    {
        var elements = await _elementRepository.GetAllByVariantAsync(
            request.ServiceVariantId,
            cancellationToken);

        return elements.Select(e => new ServiceVariantElementDto(
            e.Id,
            e.ServiceVariantId,
            e.ServiceVariant?.Description,
            e.Code,
            e.Description,
            e.CreatedAt
        )).ToList();
    }
}

public class GetServiceVariantElementsQueryValidator
    : FluentValidation.AbstractValidator<GetServiceVariantElementsQuery>
{
    public GetServiceVariantElementsQueryValidator()
    {
        RuleFor(x => x.ServiceVariantId)
            .NotEmpty().WithMessage("ServiceVariant ID is required.");
    }
}
