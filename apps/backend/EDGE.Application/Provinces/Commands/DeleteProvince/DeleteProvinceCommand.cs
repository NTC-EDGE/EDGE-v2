using MediatR;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Provinces.Commands.DeleteProvince;

public record DeleteProvinceCommand(Guid Id) : IRequest<ApiResponse<string>>;
