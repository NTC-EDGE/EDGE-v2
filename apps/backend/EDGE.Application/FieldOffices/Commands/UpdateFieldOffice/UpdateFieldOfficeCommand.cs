using MediatR;
using EDGE.Application.FieldOffices.DTOs;
using EDGE.Application.FieldOffices.Dtos;

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
    Guid OfficerInChargeId,
    bool IsActive,
    bool AllowSpectrumInspection,
    bool AllowPermitIssuance,
    bool AllowComplaintReception
) : IRequest<FieldOfficeDto?>;
