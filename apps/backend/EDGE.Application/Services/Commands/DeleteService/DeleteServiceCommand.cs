using System;
using MediatR;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Services.Commands.DeleteService;

public record DeleteServiceCommand(Guid Id) : IRequest<ApiResponse<string>>;
