using MediatR;
using EDGE.Application.Common.Models;
using EDGE.Application.Regions.Dtos;

namespace EDGE.Application.Regions.Queries.GetRegions;

public record GetRegionsQuery(bool? ActiveOnly = null) : IRequest<ApiResponse<List<RegionDto>>>;
