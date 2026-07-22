using System;
using MediatR;
using EDGE.Application.Common.Models;
using EDGE.Application.ServiceCategories.Dtos;

namespace EDGE.Application.ServiceCategories.Queries.GetServiceCategoryById;

public record GetServiceCategoryByIdQuery(Guid Id) : IRequest<ApiResponse<ServiceCategoryDto>>;
