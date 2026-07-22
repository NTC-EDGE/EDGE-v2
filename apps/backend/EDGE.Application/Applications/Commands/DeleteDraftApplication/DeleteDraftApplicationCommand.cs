using System;
using MediatR;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Applications.Commands.DeleteDraftApplication;

public record DeleteDraftApplicationCommand(Guid Id) : IRequest<ApiResponse<bool>>;
