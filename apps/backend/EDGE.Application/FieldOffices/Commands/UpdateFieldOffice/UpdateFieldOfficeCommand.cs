using MediatR;
using EDGE.Application.FieldOffices.DTOs;

namespace EDGE.Application.FieldOffices.Commands.UpdateFieldOffice;

public record UpdateFieldOfficeCommand(
    Guid Id,
    Guid TenantId,
    string Name,
    string Code,
    string? Description,
    Guid RegionId,
    Guid? ProvinceId,
    string Address,
    string ContactPhone,
    string ContactEmail,
    string OfficerInCharge,
    bool IsActive,
    bool AllowSpectrumInspection,
    bool AllowPermitIssuance,
    bool AllowComplaintReception
) : IRequest<FieldOfficeDto?>;
