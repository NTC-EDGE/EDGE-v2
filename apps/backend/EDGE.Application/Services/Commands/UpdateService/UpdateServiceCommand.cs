using System;
using MediatR;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Services.Commands.UpdateService;

public record UpdateServiceCommand : IRequest<ApiResponse<string>>
{
    public required Guid Id { get; init; }
    public required Guid ServiceCategoryId { get; init; }
    public Guid? TenantId { get; init; }
    public required string Name { get; init; }
    public string? Group { get; init; }
    public string? Code { get; init; }
    public string? Description { get; init; }
    public string? Contract { get; init; }
}
