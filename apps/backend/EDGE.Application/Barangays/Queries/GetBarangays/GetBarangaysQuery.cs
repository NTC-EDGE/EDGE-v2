using MediatR;
using EDGE.Application.Common.Models;
using EDGE.Application.Barangays.Dtos;

namespace EDGE.Application.Barangays.Queries.GetBarangays;

public record GetBarangaysQuery(Guid? MunicipalityId = null, bool? ActiveOnly = null) : IRequest<ApiResponse<List<BarangayDto>>>;
