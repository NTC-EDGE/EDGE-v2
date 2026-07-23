using System;
using MediatR;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Requirements.Commands.DeleteRequirement;

public record DeleteRequirementCommand(Guid Id) : IRequest<ApiResponse<Guid>>;
