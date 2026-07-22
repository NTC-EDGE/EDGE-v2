using System;
using MediatR;
using EDGE.Application.Common.Models;

namespace EDGE.Application.ServiceCategories.Commands.DeleteServiceCategory;

public record DeleteServiceCategoryCommand(Guid Id) : IRequest<ApiResponse<string>>;
