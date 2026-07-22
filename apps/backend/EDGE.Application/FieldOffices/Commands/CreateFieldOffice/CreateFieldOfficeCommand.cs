using System;
using MediatR;
using EDGE.Application.Common.Models;

namespace EDGE.Application.FieldOffices.Commands.CreateFieldOffice;

public record CreateFieldOfficeCommand : IRequest<ApiResponse<Guid>>
{
    public required string Name { get; init; }
    public required Guid RegionId { get; init; }
    public string? Code { get; init; }
}
