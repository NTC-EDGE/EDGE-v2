using System;
using MediatR;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Applications.Commands.ApproveSoa;

public record ApproveSoaCommand(Guid? SoaId = null, string? Remarks = null, Guid? ApplicationId = null) : IRequest<ApiResponse<Guid>>;
