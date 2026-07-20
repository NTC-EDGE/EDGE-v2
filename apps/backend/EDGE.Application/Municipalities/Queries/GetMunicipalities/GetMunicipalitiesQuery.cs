using MediatR;
using EDGE.Application.Common.Models;
using EDGE.Application.Municipalities.Dtos;

namespace EDGE.Application.Municipalities.Queries.GetMunicipalities;

public record GetMunicipalitiesQuery(Guid? ProvinceId = null, bool? ActiveOnly = null) : IRequest<ApiResponse<List<MunicipalityDto>>>;
