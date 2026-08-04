using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Domain.Enums;

namespace EDGE.Application.ServiceVariants.Commands.UpdateServiceVariant;

public class UpdateServiceVariantCommandHandler(IServiceVariantRepository repository, IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateServiceVariantCommand, ApiResponse<bool>>
{
    public async Task<ApiResponse<bool>> Handle(UpdateServiceVariantCommand request, CancellationToken cancellationToken)
    {
        var serviceVariant = await repository.GetByIdAsync(request.Id, cancellationToken);
        if (serviceVariant == null)
        {
            return ApiResponse<bool>.Fail($"Service variant with ID '{request.Id}' was not found.");
        }

        var cleanType = request.Type.Replace("-", "");
        if (!Enum.TryParse<ServiceVariantType>(cleanType, true, out var variantType))
        {
            return ApiResponse<bool>.Fail($"Invalid Service Variant Type '{request.Type}'. Allowed: New, Renewal, Modification, Retaker, FirstTaker, Upgrade.");
        }

        serviceVariant.ServiceId = request.ServiceId;
        serviceVariant.Type = variantType;
        serviceVariant.Description = request.Description;

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<bool>.Success(true, "Service variant updated successfully.");
    }
}
