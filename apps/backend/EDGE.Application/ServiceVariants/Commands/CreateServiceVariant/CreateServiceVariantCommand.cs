using System;
using MediatR;
using EDGE.Application.Common.Models;

namespace EDGE.Application.ServiceVariants.Commands.CreateServiceVariant;

public record CreateServiceVariantCommand : IRequest<ApiResponse<Guid>>
{
    public required Guid ServiceId { get; init; }
    public required string Type { get; init; }
    public string? Description { get; init; }
}
