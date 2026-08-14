using System;
using MediatR;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Applications.Commands.UpdateSoa;

public record UpdateSoaCommand(
    Guid SoaId,
    DateTime? DueDate = null,
    string? IssuedToName = null,
    string? IssuedToAddress = null,
    string? Remarks = null
) : IRequest<ApiResponse<Guid>>;
