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

    public List<ApplicantInputDto> Applicants { get; init; } = new();
}

public record ApplicantInputDto
{
    public string ApplicantType { get; init; } = "Individual"; // Individual, Company
    public ApplicantDetailInputDto Details { get; init; } = new();
    public CompanyDetailInputDto? Company { get; init; }
}

public record ApplicantDetailInputDto
{
    public Guid? BarangayId { get; init; }
    public string? Address { get; init; }
    public string? FirstName { get; init; }
    public string? MiddleName { get; init; }
    public string? LastName { get; init; }
    public string? Suffix { get; init; }
    public string? Nationality { get; init; }
    public string? Sex { get; init; }
    public double? Height { get; init; }
    public double? Weight { get; init; }
    public DateOnly? BirthDate { get; init; }
    public string? ContactNumber { get; init; }
    public string? ZipCode { get; init; }
    public string? SchoolAttended { get; init; }
    public string? CourseTaken { get; init; }
    public string? YearGraduated { get; init; }
    public string? ESignature { get; init; }
}

public record CompanyDetailInputDto
{
    public Guid? BarangayId { get; init; }
    public string? Address { get; init; }
    public string? Name { get; init; }
    public string? RegistrationNumber { get; init; }
    public string? ContactNumber { get; init; }
    public string? Email { get; init; }
    public string? EntityType { get; init; }
}
