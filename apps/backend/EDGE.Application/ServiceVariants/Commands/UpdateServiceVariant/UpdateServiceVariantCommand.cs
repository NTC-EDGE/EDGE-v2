using System;
using MediatR;
using EDGE.Application.Common.Models;

namespace EDGE.Application.ServiceVariants.Commands.UpdateServiceVariant;

public record UpdateServiceVariantCommand : IRequest<ApiResponse<bool>>
{
    public Guid Id { get; init; }
    public required Guid ServiceId { get; init; }
    public required string Type { get; init; }
    public string? Description { get; init; }
}
