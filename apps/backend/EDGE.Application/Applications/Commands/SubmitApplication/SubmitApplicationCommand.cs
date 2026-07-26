using System;
using System.Collections.Generic;
using MediatR;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Applications.Commands.SubmitApplication;

public record SubmitApplicationCommand : IRequest<ApiResponse<Guid>>
{
    public Guid TenantId { get; init; }
    public string SubmissionMode { get; init; } = "Single";   // Single | Bulk
    public bool IsDraft { get; init; } = false;

    public Guid? ServiceId { get; init; }
    public Guid? ScheduleId { get; init; }
    public Guid? FieldOfficeId { get; init; }

    public List<ApplicantSubmissionDto> Applicants { get; init; } = new();
}

public record ApplicantSubmissionDto
{
    public string FirstName { get; init; } = "";
    public string LastName { get; init; } = "";
    public string Email { get; init; } = "";
    public string ContactNumber { get; init; } = "";
    public string Address { get; init; } = "";
    public DateOnly BirthDate { get; init; }

    public List<FormFieldValueSubmissionDto> FormFieldValues { get; init; } = new();
}

public record FormFieldValueSubmissionDto
{
    public Guid FieldId { get; init; }
    public string? FieldLabel { get; init; }
    public string Value { get; init; } = "";
}