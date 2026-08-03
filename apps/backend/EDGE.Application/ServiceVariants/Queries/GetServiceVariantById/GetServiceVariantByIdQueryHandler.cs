using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Application.Services.Dtos;

namespace EDGE.Application.ServiceVariants.Queries.GetServiceVariantById;

public class GetServiceVariantByIdQueryHandler(IServiceVariantRepository repository)
    : IRequestHandler<GetServiceVariantByIdQuery, ApiResponse<ServiceVariantDto>>
{
    public async Task<ApiResponse<ServiceVariantDto>> Handle(GetServiceVariantByIdQuery request, CancellationToken cancellationToken)
    {
        var variant = await repository.GetByIdAsync(request.Id, cancellationToken);
        if (variant == null)
        {
            return ApiResponse<ServiceVariantDto>.Fail($"Service variant with ID '{request.Id}' was not found.");
        }

        var dto = new ServiceVariantDto
        {
            Id = variant.Id,
            ServiceId = variant.ServiceId,
            ServiceName = variant.Service?.Name,
            Type = variant.Type.ToString(),
            Description = variant.Description
        };

        return ApiResponse<ServiceVariantDto>.Success(dto, "Service variant retrieved successfully.");
    }
}
