using System;
using MediatR;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Applications.Commands.DeleteSoaLineItem;

public record DeleteSoaLineItemCommand(Guid SoaId, Guid LineItemId) : IRequest<ApiResponse<bool>>;
