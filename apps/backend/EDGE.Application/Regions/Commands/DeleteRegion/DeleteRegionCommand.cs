using MediatR;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Regions.Commands.DeleteRegion;

public record DeleteRegionCommand(Guid Id) : IRequest<ApiResponse<string>>;
