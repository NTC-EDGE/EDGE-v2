using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Models;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.ServiceCategories.Commands.DeleteServiceCategory;

public class DeleteServiceCategoryCommandHandler(IServiceCategoryRepository repository, IUnitOfWork unitOfWork) 
    : IRequestHandler<DeleteServiceCategoryCommand, ApiResponse<string>>
{
    public async Task<ApiResponse<string>> Handle(DeleteServiceCategoryCommand request, CancellationToken cancellationToken)
    {
        var category = await repository.GetByIdAsync(request.Id, cancellationToken);
        if (category == null)
        {
            return ApiResponse<string>.Fail("Service category not found.");
        }

        var hasServices = await repository.HasServicesAsync(request.Id, cancellationToken);
        if (hasServices)
        {
            return ApiResponse<string>.Fail("Cannot delete Service Category because it has associated Services.");
        }
        
        repository.Delete(category);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        
        return ApiResponse<string>.Success(category.Name, "Service category deleted successfully.");
    }
}
