using System;
using System.Collections.Generic;
using MediatR;
using EDGE.Application.Forms.Dtos;

namespace EDGE.Application.Forms.Commands.CreateForm;

public record CreateFormCommand(
    Guid ServiceId,
    string Version,
    bool CategorySelectionRequired,
    List<FormSectionDto>? Sections
) : IRequest<FormDto>;
