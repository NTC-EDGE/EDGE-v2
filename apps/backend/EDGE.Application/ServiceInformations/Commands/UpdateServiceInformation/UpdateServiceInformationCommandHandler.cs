using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;

namespace EDGE.Application.ServiceInformations.Commands.UpdateServiceInformation;

public class UpdateServiceInformationCommandHandler(
    IServiceInformationRepository repository,
    IUnitOfWork unitOfWork
) : IRequestHandler<UpdateServiceInformationCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(UpdateServiceInformationCommand request, CancellationToken cancellationToken)
    {
        var entity = await repository.GetByIdAsync(request.Id, cancellationToken);
        if (entity == null)
        {
            return ApiResponse<Guid>.NotFound($"ServiceInformation with ID '{request.Id}' was not found.");
        }

        entity.ServiceId = request.ServiceId;
        entity.Information = request.Information;
        entity.WhoMayAvail = request.WhoMayAvail;

        repository.Update(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(entity.Id, "Service information updated successfully.");
    }
}
