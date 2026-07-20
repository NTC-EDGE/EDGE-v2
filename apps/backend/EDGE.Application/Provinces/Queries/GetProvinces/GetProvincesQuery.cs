using MediatR;
using EDGE.Application.Common.Models;
using EDGE.Application.Provinces.Dtos;

namespace EDGE.Application.Provinces.Queries.GetProvinces;

public record GetProvincesQuery(Guid? RegionId = null, bool? ActiveOnly = null) : IRequest<ApiResponse<List<ProvinceDto>>>;
