using System;
using MediatR;
using EDGE.Application.Common.Models;

namespace EDGE.Application.ServiceInformations.Commands.DeleteServiceInformation;

public record DeleteServiceInformationCommand(Guid Id) : IRequest<ApiResponse<Guid>>;
