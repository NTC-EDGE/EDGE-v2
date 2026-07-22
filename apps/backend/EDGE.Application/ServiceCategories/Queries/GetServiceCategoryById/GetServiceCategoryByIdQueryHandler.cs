using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Models;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.ServiceCategories.Dtos;

namespace EDGE.Application.ServiceCategories.Queries.GetServiceCategoryById;

public class GetServiceCategoryByIdQueryHandler(IServiceCategoryRepository repository) 
    : IRequestHandler<GetServiceCategoryByIdQuery, ApiResponse<ServiceCategoryDto>>
{
    public async Task<ApiResponse<ServiceCategoryDto>> Handle(GetServiceCategoryByIdQuery request, CancellationToken cancellationToken)
    {
        var category = await repository.GetByIdAsync(request.Id, cancellationToken);
        
        if (category == null)
        {
            return ApiResponse<ServiceCategoryDto>.Fail("Service category not found.");
        }
        
        var dto = new ServiceCategoryDto(
            category.Id, 
            category.Name, 
            category.Code, 
            category.Type.ToString()
        );

        return ApiResponse<ServiceCategoryDto>.Success(dto);
    }
}
