using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Models;
using EDGE.Application.Common.Interfaces;
using EDGE.Domain.Enums;

namespace EDGE.Application.ServiceCategories.Commands.UpdateServiceCategory;

public class UpdateServiceCategoryCommandHandler(IServiceCategoryRepository repository, IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateServiceCategoryCommand, ApiResponse<string>>
{
    public async Task<ApiResponse<string>> Handle(UpdateServiceCategoryCommand request, CancellationToken cancellationToken)
    {
        var category = await repository.GetByIdAsync(request.Id, cancellationToken);
        if (category == null)
        {
            return ApiResponse<string>.Fail("Service category not found.");
        }

        if (!Enum.TryParse<ServiceCategoryType>(request.Type, true, out var type))
        {
            return ApiResponse<string>.Fail("Invalid Type value.");
        }

        category.Name = request.Name;
        category.Code = request.Code;
        category.Type = type;

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<string>.Success(category.Name, "Service category updated successfully.");
    }
}
