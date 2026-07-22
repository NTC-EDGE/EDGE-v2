using System;
using MediatR;
using EDGE.Application.Common.Models;
using EDGE.Application.Services.Dtos;

namespace EDGE.Application.Services.Queries.GetServiceById;

public record GetServiceByIdQuery(Guid Id) : IRequest<ApiResponse<ServiceDto>>;
