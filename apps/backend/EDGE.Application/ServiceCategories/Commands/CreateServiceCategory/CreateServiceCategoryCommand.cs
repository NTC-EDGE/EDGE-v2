using System;
using MediatR;
using EDGE.Application.Common.Models;

namespace EDGE.Application.ServiceCategories.Commands.CreateServiceCategory;

public record CreateServiceCategoryCommand : IRequest<ApiResponse<Guid>>
{
    public required string Name { get; init; }
    public string? Code { get; init; }
    public string? Type { get; init; }
}
