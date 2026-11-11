using System;
using System.Collections.Generic;
using MediatR;
using EDGE.Application.Common.Models;
using EDGE.Application.Forms.Dtos;

namespace EDGE.Application.Forms.Commands.SaveVariantForm;

public record SaveVariantFormCommand(
    Guid VariantId,
    List<FormSectionDto>? Sections,
    string? Name = null,
    string? Version = null,
    bool? IsActive = true
) : IRequest<ApiResponse<FormDto>>;
