using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Models;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.ServiceCategories.Dtos;

namespace EDGE.Application.ServiceCategories.Queries.GetServiceCategories;

public class GetServiceCategoriesQueryHandler(IServiceCategoryRepository repository)
    : IRequestHandler<GetServiceCategoriesQuery, ApiResponse<List<ServiceCategoryDto>>>
{
    public async Task<ApiResponse<List<ServiceCategoryDto>>> Handle(GetServiceCategoriesQuery request, CancellationToken cancellationToken)
    {
        var categories = await repository.GetAllAsync(cancellationToken);

        var dtos = categories.Select(r => new ServiceCategoryDto(
            r.Id,
            r.Name,
            r.Code,
            r.Type.ToString()
        )).ToList();

        return ApiResponse<List<ServiceCategoryDto>>.Success(dtos);
    }
}
