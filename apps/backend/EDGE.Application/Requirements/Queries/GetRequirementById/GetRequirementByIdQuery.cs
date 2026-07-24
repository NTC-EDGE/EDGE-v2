using System;
using MediatR;
using EDGE.Application.Common.Models;
using EDGE.Application.Requirements.Dtos;

namespace EDGE.Application.Requirements.Queries.GetRequirementById;

public record GetRequirementByIdQuery(Guid Id) : IRequest<ApiResponse<RequirementDto>>;
