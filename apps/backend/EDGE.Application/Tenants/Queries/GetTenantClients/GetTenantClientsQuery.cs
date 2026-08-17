using System;
using System.Collections.Generic;
using MediatR;
using EDGE.Application.Tenants.DTOs;

namespace EDGE.Application.Tenants.Queries.GetTenantClients;

public record GetTenantClientsQuery(Guid TenantId, string? Search = null) : IRequest<List<TenantClientDto>>;
