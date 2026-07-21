using System.Collections.Generic;
using MediatR;
using EDGE.Application.Common.Models;
using EDGE.Application.Services.Dtos;

namespace EDGE.Application.Services.Queries.GetServices;

public record GetServicesQuery : IRequest<ApiResponse<List<ServiceDto>>>;
