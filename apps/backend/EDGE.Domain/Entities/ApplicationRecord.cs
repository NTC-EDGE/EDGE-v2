using EDGE.Domain.Common;
using EDGE.Domain.Enums;

namespace EDGE.Domain.Entities;

public class ApplicationRecord : AuditableEntity
{
    public string Title { get; set; } = string.Empty;
    public string ApplicantName { get; set; } = string.Empty;
    public ApplicationStatus Status { get; set; } = ApplicationStatus.Submitted;
}
