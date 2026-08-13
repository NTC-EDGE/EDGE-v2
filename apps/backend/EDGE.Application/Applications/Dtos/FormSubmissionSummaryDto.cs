using System;

namespace EDGE.Application.Applications.Dtos;

public class FormSubmissionSummaryDto
{
    public Guid Id { get; set; }
    public Guid FormId { get; set; }
    public Guid ApplicantId { get; set; }
    public Guid? ApplicationServiceId { get; set; }
    public DateTime CreatedAt { get; set; }
}
