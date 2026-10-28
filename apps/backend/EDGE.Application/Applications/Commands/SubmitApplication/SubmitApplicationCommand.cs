using System;
using System.Collections.Generic;
using MediatR;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Applications.Commands.SubmitApplication;

public record SubmitApplicationCommand : IRequest<ApiResponse<Guid>>
{
    public Guid TenantId { get; init; }
    public string SubmissionMode { get; init; } = "Single";   // Single | Bulk
    public string Intent { get; init; } = "Regular";          // Regular | AssessmentOnly
    public bool IsDraft { get; init; } = false;
    public Guid? ExistingDraftId { get; init; }
    public Guid? RenewedFromApplicationId { get; init; }

    public Guid? ServiceId { get; init; }
    public Guid? ScheduleId { get; init; }
    public Guid? FieldOfficeId { get; init; }
    public Guid? ServiceVariantId { get; init; }
    public List<Guid> ServiceVariantElementIds { get; init; } = new();

    public List<ApplicantSubmissionDto> Applicants { get; init; } = new();
}

public record ApplicantSubmissionDto
{
    public Guid? ServiceId { get; init; }
    public Guid? ServiceVariantId { get; init; }

    public string FirstName { get; init; } = "";
    public string? MiddleName { get; init; }
    public string LastName { get; init; } = "";
    public string? Suffix { get; init; }
    public string? ApplicantType { get; init; }
    public string? CompanyName { get; init; }
    public string? RepresentativeName { get; init; }
    public string? DtiSecRegistration { get; init; }
    public string Email { get; init; } = "";
    public string ContactNumber { get; init; } = "";
    public string Address { get; init; } = "";
    public DateOnly? BirthDate { get; init; }
    public string? Sex { get; init; }
    public string? CivilStatus { get; init; }
    public string? Nationality { get; init; }
    public double? Height { get; init; }
    public double? Weight { get; init; }
    public string? ZipCode { get; init; }
    public string? SchoolAttended { get; init; }
    public string? CourseTaken { get; init; }
    public string? YearGraduated { get; init; }
    public Guid? BarangayId { get; init; }
    public string? ESignature { get; init; }

    public List<FormFieldValueSubmissionDto> FormFieldValues { get; init; } = new();
}

public record FormFieldValueSubmissionDto
{
    public Guid? FieldId { get; init; }
    public string? FieldLabel { get; init; }
    public string Value { get; init; } = "";
}