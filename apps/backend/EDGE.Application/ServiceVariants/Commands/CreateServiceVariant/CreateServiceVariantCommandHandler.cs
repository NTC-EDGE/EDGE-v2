using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;

namespace EDGE.Application.ServiceVariants.Commands.CreateServiceVariant;

public class CreateServiceVariantCommandHandler(IServiceVariantRepository repository, IUnitOfWork unitOfWork)
    : IRequestHandler<CreateServiceVariantCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateServiceVariantCommand request, CancellationToken cancellationToken)
    {
        var cleanType = request.Type.Replace("-", "");
        if (!Enum.TryParse<ServiceVariantType>(cleanType, true, out var variantType))
        {
            return ApiResponse<Guid>.Fail($"Invalid Service Variant Type '{request.Type}'. Allowed: New, Renewal, Modification, Retaker, FirstTaker, Upgrade.");
        }

        var serviceVariant = new ServiceVariant
        {
            ServiceId = request.ServiceId,
            Type = variantType,
            Description = request.Description
        };

        await repository.AddAsync(serviceVariant, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(serviceVariant.Id, "Service variant created successfully.");
    }
}
