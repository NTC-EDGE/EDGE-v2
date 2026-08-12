using System;
using MediatR;
using EDGE.Domain.Enums;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Applications.Commands.ReturnOp;

public record ReturnOpCommand(Guid OpId, string Remarks, ReturnTarget ReturnTo) : IRequest<ApiResponse<bool>>;
