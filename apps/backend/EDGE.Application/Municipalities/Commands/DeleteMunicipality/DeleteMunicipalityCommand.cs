using MediatR;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Municipalities.Commands.DeleteMunicipality;

public record DeleteMunicipalityCommand(Guid Id) : IRequest<ApiResponse<string>>;
