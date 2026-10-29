using System;
using MediatR;
using EDGE.Application.Common.Models;
using EDGE.Application.Forms.Dtos;

namespace EDGE.Application.Forms.Queries.GetFormByServiceId;

public record GetFormByServiceIdQuery(
    Guid ServiceId,
    Guid? ServiceVariantId = null,
    string? FormKey = null
) : IRequest<ApiResponse<FormDto>>;
