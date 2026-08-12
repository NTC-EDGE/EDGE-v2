using System;
using MediatR;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Applications.Commands.TogglePinApplication;

public record TogglePinApplicationCommand(Guid Id, bool? IsPinned = null) : IRequest<ApiResponse<bool>>;
