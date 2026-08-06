using MediatR;
using FluentValidation;
using EDGE.Application.ServiceVariantElements.DTOs;
using EDGE.Application.Common.Interfaces;
using System.Threading;
using System.Threading.Tasks;

namespace EDGE.Application.ServiceVariantElements.Queries.GetServiceVariantElementById;

public record GetServiceVariantElementByIdQuery(Guid Id) : IRequest<ServiceVariantElementDto?>;

public class GetServiceVariantElementByIdQueryHandler
    : IRequestHandler<GetServiceVariantElementByIdQuery, ServiceVariantElementDto?>
{
    private readonly IServiceVariantElementRepository _elementRepository;

    public GetServiceVariantElementByIdQueryHandler(IServiceVariantElementRepository elementRepository)
    {
        _elementRepository = elementRepository;
    }

    public async Task<ServiceVariantElementDto?> Handle(
        GetServiceVariantElementByIdQuery request,
        CancellationToken cancellationToken)
    {
        var e = await _elementRepository.GetByIdAsync(request.Id, cancellationToken);
        if (e == null)
        {
            return null;
        }

        return new ServiceVariantElementDto(
            e.Id,
            e.ServiceVariantId,
            e.ServiceVariant?.Description,
            e.Code,
            e.Description,
            e.CreatedAt
        );
    }
}

public class GetServiceVariantElementByIdQueryValidator
    : FluentValidation.AbstractValidator<GetServiceVariantElementByIdQuery>
{
    public GetServiceVariantElementByIdQueryValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Element ID is required.");
    }
}
