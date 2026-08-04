using System;
using MediatR;
using EDGE.Application.Common.Models;

namespace EDGE.Application.ServiceVariants.Commands.DeleteServiceVariant;

public record DeleteServiceVariantCommand(Guid Id) : IRequest<ApiResponse<bool>>;
