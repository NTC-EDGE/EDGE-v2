using System;
using System.Collections.Generic;
using MediatR;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Applications.Commands.SubmitApplication;

public record SubmitApplicationCommand : IRequest<ApiResponse<Guid>>
{
    public required Guid TenantId { get; init; }
    public string SubmissionMode { get; init; } = "Single"; // Single, Bulk
    public string? DataEntryMethod { get; init; } // Manual, CSV
    public string Status { get; init; } = "Draft"; // Draft, Submitted
    
    public Guid? ServiceCategoryId { get; init; }
    public Guid? ServiceId { get; init; }
    public Guid? ServiceVariantId { get; init; }
    public string? ApplicationTypeKey { get; init; }
    
    public Guid? RegionId { get; init; }
    public Guid? ScheduleId { get; init; }
    public string? Office { get; init; }
    public string? DynamicDataJson { get; init; }
    public string AccountType { get; init; } = "Individual"; // Individual, Company

    public List<Guid> ApplicantIds { get; init; } = new();
}
