using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;

namespace EDGE.Application.ServiceInformations.Commands.DeleteServiceInformation;

public class DeleteServiceInformationCommandHandler(
    IServiceInformationRepository repository,
    IUnitOfWork unitOfWork
) : IRequestHandler<DeleteServiceInformationCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(DeleteServiceInformationCommand request, CancellationToken cancellationToken)
    {
        var entity = await repository.GetByIdAsync(request.Id, cancellationToken);
        if (entity == null)
        {
            return ApiResponse<Guid>.NotFound($"ServiceInformation with ID '{request.Id}' was not found.");
        }

        repository.Delete(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(entity.Id, "Service information deleted successfully.");
    }
}
