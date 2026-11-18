using System;
using MediatR;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Applications.Commands.ApproveSoa;

public record ApproveSoaCommand(
    Guid? SoaId = null,
    string? Remarks = null,
    Guid? ApplicationId = null,
    string? OpNumber = null
) : IRequest<ApiResponse<Guid>>;
