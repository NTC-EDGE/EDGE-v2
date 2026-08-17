using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Models;
using EDGE.Application.Common.Interfaces;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;

namespace EDGE.Application.ServiceCategories.Commands.CreateServiceCategory;

public class CreateServiceCategoryCommandHandler(IServiceCategoryRepository repository, IUnitOfWork unitOfWork)
    : IRequestHandler<CreateServiceCategoryCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateServiceCategoryCommand request, CancellationToken cancellationToken)
    {
        ServiceCategoryType type = ServiceCategoryType.Certificate;
        if (!string.IsNullOrWhiteSpace(request.Type) && Enum.TryParse<ServiceCategoryType>(request.Type, true, out var parsedType))
        {
            type = parsedType;
        }

        var category = new ServiceCategory
        {
            Name = request.Name,
            Code = request.Code,
            Type = type
        };

        await repository.AddAsync(category, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(category.Id, "Service category created successfully.");
    }
}
