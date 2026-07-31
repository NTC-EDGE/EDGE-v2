using System;
using MediatR;
using EDGE.Application.Tenants.DTOs;

namespace EDGE.Application.Tenants.Commands;

public record ToggleTenantActiveCommand(Guid Id) : IRequest<TenantDto>;
