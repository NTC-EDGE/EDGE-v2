using System;
using MediatR;
using EDGE.Application.ServiceVariantElementFees.DTOs;
using EDGE.Application.Common.Models;

namespace EDGE.Application.ServiceVariantElementFees.Queries.GetServiceVariantElementFees;

public record GetServiceVariantElementFeesQuery(
    Guid? ServiceVariantId = null,
    Guid? ServiceId = null,
    Guid? ElementId = null,
    string? ApplicationType = null,
    int? PageNumber = null,
    int? PageSize = null,
    string? SearchTerm = null
) : IRequest<PaginatedApiResponse<ServiceVariantElementFeeGroupDto>>;
