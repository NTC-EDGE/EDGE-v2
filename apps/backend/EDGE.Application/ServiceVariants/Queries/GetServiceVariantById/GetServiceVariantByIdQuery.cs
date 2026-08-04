using System;
using MediatR;
using EDGE.Application.Common.Models;
using EDGE.Application.Services.Dtos;

namespace EDGE.Application.ServiceVariants.Queries.GetServiceVariantById;

public record GetServiceVariantByIdQuery(Guid Id) : IRequest<ApiResponse<ServiceVariantDto>>;
