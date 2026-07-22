using System;
using MediatR;
using EDGE.Application.Common.Models;

namespace EDGE.Application.ServiceCategories.Commands.UpdateServiceCategory;

public record UpdateServiceCategoryCommand : IRequest<ApiResponse<string>>
{
    public required Guid Id { get; init; }
    public required string Name { get; init; }
    public string? Code { get; init; }
    public required string Type { get; init; }
}
