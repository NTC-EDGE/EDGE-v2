using System;
using MediatR;
using EDGE.Application.Common.Models;

namespace EDGE.Application.ServiceInformations.Commands.UpdateServiceInformation;

public record UpdateServiceInformationCommand(
    Guid Id,
    Guid ServiceId,
    string Information,
    string WhoMayAvail
) : IRequest<ApiResponse<Guid>>;
