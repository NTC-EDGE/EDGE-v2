using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Catalog.ServiceVariants.DTOs;

namespace EDGE.Application.Catalog.ServiceVariants.Queries;

public record GetServiceVariantsQuery(Guid ServiceId) : IRequest<List<ServiceVariantDto>>;

public class GetServiceVariantsQueryHandler : IRequestHandler<GetServiceVariantsQuery, List<ServiceVariantDto>>
{
    private readonly IServiceVariantRepository _variantRepository;

    public GetServiceVariantsQueryHandler(IServiceVariantRepository variantRepository)
    {
        _variantRepository = variantRepository;
    }

    public async Task<List<ServiceVariantDto>> Handle(GetServiceVariantsQuery request, CancellationToken cancellationToken)
    {
        var variants = await _variantRepository.GetByServiceIdAsync(request.ServiceId, cancellationToken);

        return variants
            .Select(v => new ServiceVariantDto(v.Id, v.ServiceId, v.Type, v.Description, v.CreatedAt))
            .ToList();
    }
}
