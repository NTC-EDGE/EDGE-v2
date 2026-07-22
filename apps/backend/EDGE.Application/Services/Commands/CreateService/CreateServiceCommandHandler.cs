using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Domain.Entities;

namespace EDGE.Application.Services.Commands.CreateService;

public class CreateServiceCommandHandler(IServiceRepository repository, IUnitOfWork unitOfWork)
    : IRequestHandler<CreateServiceCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateServiceCommand request, CancellationToken cancellationToken)
    {
        var service = new Service
        {
            ServiceCategoryId = request.ServiceCategoryId,
            TenantId = request.TenantId,
            Name = request.Name,
            Group = request.Group,
            Code = request.Code,
            Description = request.Description,
            Contract = string.IsNullOrWhiteSpace(request.Contract) ? "{}" : request.Contract
        };

        await repository.AddAsync(service, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(service.Id, "Service created successfully.");
    }
}
