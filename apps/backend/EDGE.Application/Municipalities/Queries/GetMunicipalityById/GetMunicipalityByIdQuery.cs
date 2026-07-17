using MediatR;
using EDGE.Application.Common.Models;
using EDGE.Application.Municipalities.Dtos;

namespace EDGE.Application.Municipalities.Queries.GetMunicipalityById;

public record GetMunicipalityByIdQuery(Guid Id) : IRequest<ApiResponse<MunicipalityDto>>;
