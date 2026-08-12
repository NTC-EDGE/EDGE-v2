using System;
using MediatR;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Applications.Commands.ReturnOp;

public record ReturnOpCommand(Guid OpId, string Remarks, string ReturnTo) : IRequest<ApiResponse<bool>>;
