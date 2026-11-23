using System;
using System.Collections.Generic;

namespace EDGE.Application.Tenants.DTOs;

public class PublicFieldOfficeDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string ContactPhone { get; set; } = string.Empty;
    public string ContactEmail { get; set; } = string.Empty;
    public string OfficeHead { get; set; } = string.Empty;
    public bool AllowPermitIssuance { get; set; }
    public bool AllowComplaintReception { get; set; }
    public bool AllowSpectrumInspection { get; set; }
}

public class PublicRegionalOfficeDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid RegionId { get; set; }
    public string RegionName { get; set; } = string.Empty;
    public string RegionCode { get; set; } = string.Empty;
    public string PrimaryAddress { get; set; } = string.Empty;
    public string PrimaryPhone { get; set; } = string.Empty;
    public string PrimaryEmail { get; set; } = string.Empty;
    public List<PublicFieldOfficeDto> FieldOffices { get; set; } = new();
}
