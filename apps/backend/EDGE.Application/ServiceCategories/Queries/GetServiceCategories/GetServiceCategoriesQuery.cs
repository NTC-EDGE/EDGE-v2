using System.Collections.Generic;
using MediatR;
using EDGE.Application.Common.Models;
using EDGE.Application.ServiceCategories.Dtos;

namespace EDGE.Application.ServiceCategories.Queries.GetServiceCategories;

public record GetServiceCategoriesQuery : IRequest<ApiResponse<List<ServiceCategoryDto>>>;
