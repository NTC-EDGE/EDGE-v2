using System;
using MediatR;
using EDGE.Application.Common.Models;
using EDGE.Application.ServiceInformations.Dtos;

namespace EDGE.Application.ServiceInformations.Queries.GetServiceInformations;

public record GetServiceInformationsQuery(
    string? Search = null,
    Guid? ServiceId = null,
    int PageNumber = 1,
    int PageSize = 10
) : IRequest<PaginatedApiResponse<ServiceInformationDto>>;
