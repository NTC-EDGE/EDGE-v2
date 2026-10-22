using System;
using EDGE.Domain.Enums;

namespace EDGE.Application.FieldOffices.DTOs;

public class CreateFieldOfficeRequest
{
    public string? TenantId { get; set; }
    public string? Name { get; set; }
    public string? Code { get; set; }
    public FieldOfficeCategory? Category { get; set; }
    public string? Description { get; set; }
    public string? RegionId { get; set; }
    public string? ProvinceId { get; set; }
    public string? Address { get; set; }
    public string? ContactPhone { get; set; }
    public string? ContactEmail { get; set; }
    public string? OfficerInChargeId { get; set; }
    public bool AllowSpectrumInspection { get; set; } = true;
    public bool AllowPermitIssuance { get; set; } = true;
    public bool AllowComplaintReception { get; set; } = true;

    public Guid? GetTenantGuid() => Guid.TryParse(TenantId, out var g) ? g : null;
    public Guid? GetRegionGuid() => Guid.TryParse(RegionId, out var g) ? g : null;
    public Guid? GetProvinceGuid() => Guid.TryParse(ProvinceId, out var g) ? g : null;
    public Guid? GetOfficerInChargeGuid() => Guid.TryParse(OfficerInChargeId, out var g) ? g : null;
}

public class UpdateFieldOfficeRequest : CreateFieldOfficeRequest
{
    public string? Id { get; set; }
    public bool IsActive { get; set; } = false;

    public Guid? GetIdGuid() => Guid.TryParse(Id, out var g) ? g : null;
}
