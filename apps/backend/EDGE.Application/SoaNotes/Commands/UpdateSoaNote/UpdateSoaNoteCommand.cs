using System;
using MediatR;
using EDGE.Application.SoaNotes.DTOs;

namespace EDGE.Application.SoaNotes.Commands.UpdateSoaNote;

public record UpdateSoaNoteCommand(
    Guid Id,
    string Notes,
    string? Code = null,
    string? Title = null,
    Guid? TenantId = null
) : IRequest<SoaNoteDto>;
