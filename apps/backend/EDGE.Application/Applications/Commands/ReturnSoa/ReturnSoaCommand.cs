using System;
using MediatR;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Applications.Commands.ReturnSoa;

public record ReturnSoaCommand(Guid SoaId, string Remarks) : IRequest<ApiResponse<bool>>;
