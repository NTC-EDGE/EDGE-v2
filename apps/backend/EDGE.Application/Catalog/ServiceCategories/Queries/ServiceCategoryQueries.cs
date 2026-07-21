using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Exceptions;
using EDGE.Application.Catalog.ServiceCategories.DTOs;

namespace EDGE.Application.Catalog.ServiceCategories.Queries;

public record GetServiceCategoriesQuery() : IRequest<List<ServiceCategoryDto>>;

public class GetServiceCategoriesQueryHandler : IRequestHandler<GetServiceCategoriesQuery, List<ServiceCategoryDto>>
{
    private readonly IServiceCategoryRepository _repository;

    public GetServiceCategoriesQueryHandler(IServiceCategoryRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<ServiceCategoryDto>> Handle(GetServiceCategoriesQuery request, CancellationToken cancellationToken)
    {
        var categories = await _repository.GetAllAsync(cancellationToken);

        return categories
            .Select(c => new ServiceCategoryDto(c.Id, c.Type, c.Name, c.Code, c.CreatedAt))
            .ToList();
    }
}

public record GetServiceCategoryByIdQuery(Guid Id) : IRequest<ServiceCategoryDto?>;

public class GetServiceCategoryByIdQueryHandler : IRequestHandler<GetServiceCategoryByIdQuery, ServiceCategoryDto?>
{
    private readonly IServiceCategoryRepository _repository;

    public GetServiceCategoryByIdQueryHandler(IServiceCategoryRepository repository)
    {
        _repository = repository;
    }

    public async Task<ServiceCategoryDto?> Handle(GetServiceCategoryByIdQuery request, CancellationToken cancellationToken)
    {
        var category = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (category is null)
        {
            return null;
        }

        return new ServiceCategoryDto(category.Id, category.Type, category.Name, category.Code, category.CreatedAt);
    }
}
