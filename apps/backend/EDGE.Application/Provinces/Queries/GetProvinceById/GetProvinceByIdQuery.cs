using MediatR;
using EDGE.Application.Common.Models;
using EDGE.Application.Provinces.Dtos;

namespace EDGE.Application.Provinces.Queries.GetProvinceById;

public record GetProvinceByIdQuery(Guid Id) : IRequest<ApiResponse<ProvinceDto>>;
