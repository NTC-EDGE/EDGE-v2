using System;

namespace EDGE.Application.FieldOffices.DTOs;

public record FieldOfficeDto(
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
    string? OfficerInChargeName,
    string? OfficerInChargeEmail,
    bool IsActive,
    bool AllowSpectrumInspection,
    bool AllowPermitIssuance,
    bool AllowComplaintReception,
    string? RegionName,
    string? ProvinceName
);
