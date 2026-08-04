using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;

namespace EDGE.Application.ServiceVariants.Commands.DeleteServiceVariant;

public class DeleteServiceVariantCommandHandler(IServiceVariantRepository repository, IUnitOfWork unitOfWork)
    : IRequestHandler<DeleteServiceVariantCommand, ApiResponse<bool>>
{
    public async Task<ApiResponse<bool>> Handle(DeleteServiceVariantCommand request, CancellationToken cancellationToken)
    {
        var serviceVariant = await repository.GetByIdAsync(request.Id, cancellationToken);
        if (serviceVariant == null)
        {
            return ApiResponse<bool>.Fail($"Service variant with ID '{request.Id}' was not found.");
        }

        repository.Delete(serviceVariant);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<bool>.Success(true, "Service variant deleted successfully.");
    }
}
