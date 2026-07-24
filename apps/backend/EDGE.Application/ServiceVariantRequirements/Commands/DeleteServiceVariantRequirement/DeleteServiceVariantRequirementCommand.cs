using System;
using MediatR;
using EDGE.Application.Common.Models;

namespace EDGE.Application.ServiceVariantRequirements.Commands.DeleteServiceVariantRequirement;

public record DeleteServiceVariantRequirementCommand(Guid Id) : IRequest<ApiResponse<Guid>>;
