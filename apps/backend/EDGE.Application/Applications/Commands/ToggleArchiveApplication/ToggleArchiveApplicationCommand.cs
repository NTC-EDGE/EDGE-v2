using System;
using MediatR;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Applications.Commands.ToggleArchiveApplication;

public record ToggleArchiveApplicationCommand(Guid Id, bool? IsArchived = null) : IRequest<ApiResponse<bool>>;
