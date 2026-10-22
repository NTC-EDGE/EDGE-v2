using System;

namespace EDGE.Application.Applications.Dtos;

public class DraftApplicationItemDto
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid? ScheduleId { get; set; }
    public Guid? RegionId { get; set; }
    public string? Office { get; set; }
    public string? ApplicationNumber { get; set; }
    public string? ReferenceNumber { get; set; }
    public string Status { get; set; } = "Draft";
    public string SubmissionMode { get; set; } = "Single";
    public DateTime CreatedAt { get; set; }
    public Guid? ServiceId { get; set; }
    public string? ServiceName { get; set; }
    public Guid? ServiceCategoryId { get; set; }
    public string? ServiceCategoryName { get; set; }
    public string? ServiceCategoryCode { get; set; }
    public string ServiceVariant { get; set; } = string.Empty;
    public string ServiceVariantElement { get; set; } = string.Empty;
}
