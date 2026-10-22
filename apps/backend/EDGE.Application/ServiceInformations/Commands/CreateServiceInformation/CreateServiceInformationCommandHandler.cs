using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Domain.Entities;

namespace EDGE.Application.ServiceInformations.Commands.CreateServiceInformation;

public class CreateServiceInformationCommandHandler(
    IServiceInformationRepository repository,
    IUnitOfWork unitOfWork
) : IRequestHandler<CreateServiceInformationCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateServiceInformationCommand request, CancellationToken cancellationToken)
    {
        var entity = new ServiceInformation
        {
            ServiceId = request.ServiceId,
            Information = request.Information,
            WhoMayAvail = request.WhoMayAvail,
        };

        await repository.AddAsync(entity, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(entity.Id, "Service information created successfully.");
    }
}
