using System;
using MediatR;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Applications.Commands.UpdateApplicationStatus;

public record UpdateApplicationStatusCommand : IRequest<ApiResponse<Guid>>
{
    public Guid Id { get; init; }
    public Guid? TenantId { get; init; }
    public string Status { get; init; } = string.Empty;
    public string? Remarks { get; init; }
}
