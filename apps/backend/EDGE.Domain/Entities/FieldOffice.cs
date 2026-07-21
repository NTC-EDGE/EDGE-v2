using System;
using EDGE.Domain.Common;

namespace EDGE.Domain.Entities;

public class FieldOffice : AuditableEntity
{
    public string Name { get; set; } = string.Empty;
    public Guid RegionId { get; set; }
    public Region? Region { get; set; }
    public string? Code { get; set; }
}
