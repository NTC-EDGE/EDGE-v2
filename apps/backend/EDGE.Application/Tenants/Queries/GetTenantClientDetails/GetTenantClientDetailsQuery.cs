using System;
using MediatR;
using EDGE.Application.Tenants.DTOs;

namespace EDGE.Application.Tenants.Queries.GetTenantClientDetails;

public record GetTenantClientDetailsQuery(
    Guid TenantId,
    Guid ClientId
) : IRequest<TenantClientDetailsDto?>;
