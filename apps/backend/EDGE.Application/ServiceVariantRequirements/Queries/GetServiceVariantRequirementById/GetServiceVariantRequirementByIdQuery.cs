using System;
using MediatR;
using EDGE.Application.Common.Models;
using EDGE.Application.ServiceVariantRequirements.Dtos;

namespace EDGE.Application.ServiceVariantRequirements.Queries.GetServiceVariantRequirementById;

public record GetServiceVariantRequirementByIdQuery(Guid Id) : IRequest<ApiResponse<ServiceVariantRequirementDto>>;
