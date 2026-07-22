using System;
using MediatR;
using EDGE.Application.FieldOffices.Dtos;

namespace EDGE.Application.FieldOffices.Commands.CreateFieldOffice;

public record CreateFieldOfficeCommand(
    Guid TenantId,
    string Name,
    string Code,
    string? Description,
    Guid RegionId,
    Guid? ProvinceId,
    string Address,
    string ContactPhone,
    string ContactEmail,
    Guid OfficerInChargeId,
    bool IsActive = true,
    bool AllowSpectrumInspection = true,
    bool AllowPermitIssuance = true,
    bool AllowComplaintReception = true
) : IRequest<FieldOfficeDto>;
