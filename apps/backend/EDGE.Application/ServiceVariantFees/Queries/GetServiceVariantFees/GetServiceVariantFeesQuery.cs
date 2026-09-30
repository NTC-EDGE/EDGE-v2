using System;
using MediatR;
using EDGE.Application.ServiceVariantFees.DTOs;
using EDGE.Application.Common.Models;

namespace EDGE.Application.ServiceVariantFees.Queries.GetServiceVariantFees;

public record GetServiceVariantFeesQuery(
    Guid? ServiceVariantId = null,
    int? PageNumber = null,
    int? PageSize = null,
    string? SearchTerm = null
) : IRequest<PaginatedApiResponse<ServiceVariantFeeGroupDto>>;
