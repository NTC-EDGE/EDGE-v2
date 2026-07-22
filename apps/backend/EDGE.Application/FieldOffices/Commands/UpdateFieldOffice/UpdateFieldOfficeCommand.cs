using System;
using MediatR;
using EDGE.Application.Common.Models;

namespace EDGE.Application.FieldOffices.Commands.UpdateFieldOffice;

public record UpdateFieldOfficeCommand : IRequest<ApiResponse<string>>
{
    public required Guid Id { get; init; }
    public required string Name { get; init; }
    public required Guid RegionId { get; init; }
    public string? Code { get; init; }
}
