using MediatR;
using EDGE.Application.Common.Models;
using EDGE.Application.Barangays.Dtos;

namespace EDGE.Application.Barangays.Queries.GetBarangayById;

public record GetBarangayByIdQuery(Guid Id) : IRequest<ApiResponse<BarangayDto>>;
