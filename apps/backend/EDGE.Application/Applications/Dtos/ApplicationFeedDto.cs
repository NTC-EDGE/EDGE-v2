using System;
using System.Collections.Generic;
using EDGE.Application.Applicants.Dtos;

namespace EDGE.Application.Applications.Dtos;

public class ApplicationFeedDto
{
    public Guid Id { get; set; }
    public string? ApplicationNumber { get; set; }
    public string? ReferenceNumber { get; set; }
    public string Status { get; set; } = string.Empty;
    public string SubmissionMode { get; set; } = string.Empty;
    public string? Office { get; set; }
    public string? Remarks { get; set; }
    public bool IsGuest { get; set; }
    public bool IsPinned { get; set; }
    public bool IsArchived { get; set; }
    public DateTime CreatedAt { get; set; }
    public int ApplicantCount { get; set; }

    public FilingUserDto? FilingUser { get; set; }
    public List<ApplicationFeedServiceDto> Services { get; set; } = new();
}

public class ApplicationFeedServiceDto
{
    public string Name { get; set; } = string.Empty;
    public string Variant { get; set; } = string.Empty;
}
