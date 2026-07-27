using System;
using System.Collections.Generic;
using EDGE.Domain.Common;

namespace EDGE.Domain.Entities;

public class FieldOffice : AuditableEntity
{
    public Guid TenantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid RegionId { get; set; }
    public Guid? ProvinceId { get; set; }
    public string Address { get; set; } = string.Empty;
    public string ContactPhone { get; set; } = string.Empty;
    public string ContactEmail { get; set; } = string.Empty;
    public Guid OfficerInChargeId { get; set; }
    public bool IsActive { get; set; } = true;
    public bool AllowSpectrumInspection { get; set; } = true;
    public bool AllowPermitIssuance { get; set; } = true;
    public bool AllowComplaintReception { get; set; } = true;

    // Navigation properties
    public virtual Tenant Tenant { get; set; } = null!;
    public virtual TenantMember OfficerInCharge { get; set; } = null!;
    public virtual Region Region { get; set; } = null!;
    public virtual Province? Province { get; set; }
    public virtual ICollection<TenantMember> AssignedMembers { get; set; } = new List<TenantMember>();
}
