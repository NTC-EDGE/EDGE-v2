using System;
using MediatR;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Applications.Commands.ApproveSoa;

public record ApproveSoaCommand(Guid SoaId, string? Remarks) : IRequest<ApiResponse<Guid>>;
