using System;
using MediatR;
using EDGE.Application.Common.Models;
using EDGE.Application.Forms.Dtos;

namespace EDGE.Application.Forms.Queries.GetForms;

public record GetFormsQuery(
    int? PageNumber = 1,
    int? PageSize = 50,
    string? SearchTerm = null,
    Guid? ServiceId = null,
    Guid? ServiceVariantId = null,
    string? FormKey = null
) : IRequest<PaginatedApiResponse<FormDto>>;
