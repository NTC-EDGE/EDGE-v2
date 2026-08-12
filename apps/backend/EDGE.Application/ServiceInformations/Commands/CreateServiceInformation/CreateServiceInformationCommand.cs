using System;
using MediatR;
using EDGE.Application.Common.Models;

namespace EDGE.Application.ServiceInformations.Commands.CreateServiceInformation;

public record CreateServiceInformationCommand(
    Guid ServiceId,
    string Information,
    string WhoMayAvail
) : IRequest<ApiResponse<Guid>>;
