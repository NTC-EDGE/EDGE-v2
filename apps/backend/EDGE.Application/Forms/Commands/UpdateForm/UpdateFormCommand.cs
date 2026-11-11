using System;
using System.Collections.Generic;
using MediatR;
using EDGE.Application.Common.Models;
using EDGE.Application.Forms.Dtos;

namespace EDGE.Application.Forms.Commands.UpdateForm;

public record UpdateFormCommand(
    Guid Id,
    Guid ServiceId,
    string Version,
    bool CategorySelectionRequired,
    List<FormSectionDto>? Sections,
    string? Name = null,
    bool? IsActive = null,
    string? Key = null,
    Guid? ServiceVariantId = null,
    Guid? BaseFormId = null
) : IRequest<ApiResponse<FormDto>>;
