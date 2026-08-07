using System;
using System.Collections.Generic;
using MediatR;
using EDGE.Application.Common.Models;
using EDGE.Application.Services.Dtos;

namespace EDGE.Application.Services.Queries.GetServiceVariants;

public record GetServiceVariantsQuery(
    Guid? ServiceId,
    int? PageNumber = 1,
    int? PageSize = 10,
    string? SearchTerm = null
) : IRequest<PaginatedApiResponse<ServiceVariantDto>>;
