using System;
using EDGE.Domain.Common;

namespace EDGE.Domain.Entities;

public class ApplicationService : BaseEntity
{
    public Guid ApplicationId { get; set; }
    public Application? Application { get; set; }

    public Guid? ServiceCategoryId { get; set; }
    public Guid? ServiceId { get; set; }
    public Guid? ServiceVariantId { get; set; }
    public string? ApplicationTypeKey { get; set; }
    public string? DynamicDataJson { get; set; }
}
