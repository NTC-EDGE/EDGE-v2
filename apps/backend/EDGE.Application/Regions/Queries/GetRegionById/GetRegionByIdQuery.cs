using MediatR;
using EDGE.Application.Common.Models;
using EDGE.Application.Regions.Dtos;

namespace EDGE.Application.Regions.Queries.GetRegionById;

public record GetRegionByIdQuery(Guid Id) : IRequest<ApiResponse<RegionDto>>;
