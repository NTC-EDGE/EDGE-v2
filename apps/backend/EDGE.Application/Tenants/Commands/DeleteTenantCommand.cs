using MediatR;

namespace EDGE.Application.Tenants.Commands;

public record DeleteTenantCommand(Guid Id) : IRequest<bool>;
