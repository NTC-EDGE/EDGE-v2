using System;

namespace EDGE.Application.Applications.Queries.GetApplicantRequirements;

public class ApplicantRequirementItemDto
{
    public Guid RequirementId { get; set; }
    public Guid? ServiceVariantRequirementId { get; set; }
    public string RequirementName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsRequired { get; set; }
    public string? ContextKey { get; set; }

    public Guid? SubmittedRequirementId { get; set; }
    public Guid? StoredFileId { get; set; }
    public string? FileName { get; set; }
    public string? ContentType { get; set; }
    public long? FileSizeBytes { get; set; }
    public string? Url { get; set; }
    public bool IsApproved { get; set; }
    public DateTime? UploadedAt { get; set; }
}
