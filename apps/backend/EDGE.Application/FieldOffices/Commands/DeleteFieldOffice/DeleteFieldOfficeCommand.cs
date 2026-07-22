using MediatR;

namespace EDGE.Application.FieldOffices.Commands.DeleteFieldOffice;

public record DeleteFieldOfficeCommand(Guid Id, Guid TenantId) : IRequest<bool>;
