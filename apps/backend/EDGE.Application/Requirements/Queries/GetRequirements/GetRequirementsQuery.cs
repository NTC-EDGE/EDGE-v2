using System.Collections.Generic;
using MediatR;
using EDGE.Application.Common.Models;
using EDGE.Application.Requirements.Dtos;

namespace EDGE.Application.Requirements.Queries.GetRequirements;

public record GetRequirementsQuery : IRequest<ApiResponse<List<RequirementDto>>>;
