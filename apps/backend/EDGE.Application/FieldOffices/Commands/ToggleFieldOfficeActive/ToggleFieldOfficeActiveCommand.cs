using System;
using MediatR;
using EDGE.Application.FieldOffices.DTOs;

namespace EDGE.Application.FieldOffices.Commands.ToggleFieldOfficeActive;

public record ToggleFieldOfficeActiveCommand(Guid Id, Guid TenantId) : IRequest<FieldOfficeDto?>;
