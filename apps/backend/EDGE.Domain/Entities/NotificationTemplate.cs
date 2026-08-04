using System;
using EDGE.Domain.Common;

namespace EDGE.Domain.Entities;

public class NotificationTemplate : AuditableEntity
{
    public string EventKey { get; set; } = string.Empty; // "ApplicationSubmitted", "ApplicationApproved", "ApplicationRejected", "AccountCreated", "PasswordReset", "PaymentConfirmed"
    public string Name { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string BodyHtml { get; set; } = string.Empty;
    public string AvailablePlaceholders { get; set; } = string.Empty; // e.g. "{{ApplicantName}},{{ReferenceNumber}},{{ServiceName}}"
    public bool IsActive { get; set; } = true;
}
