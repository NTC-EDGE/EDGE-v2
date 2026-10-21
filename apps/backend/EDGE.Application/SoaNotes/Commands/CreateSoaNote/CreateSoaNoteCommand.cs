using System;
using MediatR;
using EDGE.Application.SoaNotes.DTOs;

namespace EDGE.Application.SoaNotes.Commands.CreateSoaNote;

public record CreateSoaNoteCommand(
    string Notes,
    string? Code = null,
    string? Title = null,
    Guid? TenantId = null
) : IRequest<SoaNoteDto>;
