using System;
using MediatR;
using System.Collections.Generic;
using EDGE.Application.ServiceVariantElementFees.DTOs;

using EDGE.Application.Common.Models;

namespace EDGE.Application.ServiceVariantElementFees.Queries.GetServiceVariantElementFees;

public record GetServiceVariantElementFeesQuery(
    Guid? ServiceVariantId = null,
    int? PageNumber = null,
    int? PageSize = null,
    string? SearchTerm = null
) : IRequest<PaginatedApiResponse<ServiceVariantElementFeeDto>>;
