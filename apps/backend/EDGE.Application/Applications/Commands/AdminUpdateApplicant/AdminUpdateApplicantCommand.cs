using System;
using System.Text.Json.Serialization;
using MediatR;
using EDGE.Application.Applicants.Dtos;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Applications.Commands.AdminUpdateApplicant;

public record AdminUpdateApplicantCommand : IRequest<ApiResponse<ApplicantDto>>
{
    [JsonIgnore]
    public Guid ApplicationId { get; init; }

    [JsonIgnore]
    public Guid ApplicantId { get; init; }

    // Root Applicant Properties
    public string? ApplicantType { get; init; }
    public string? Status { get; init; }
    public string? EvaluationRemarks { get; init; }
    public Guid? ServiceId { get; init; }
    public Guid? ServiceVariantId { get; init; }

    // Nested Details & Company structures
    public AdminUpdateApplicantDetailDto? Details { get; init; }
    public AdminUpdateCompanyDetailDto? Company { get; init; }

    // Flat fallback properties for backwards-compatibility
    public string? FirstName { get; init; }
    public string? LastName { get; init; }
    public string? MiddleName { get; init; }
    public string? Suffix { get; init; }
    public string? ContactNumber { get; init; }
    public string? Email { get; init; }
    public string? Address { get; init; }
    public string? ZipCode { get; init; }
    public string? Dob { get; init; }
    public string? Sex { get; init; }
    public double? Height { get; init; }
    public double? Weight { get; init; }
    public string? Nationality { get; init; }
    public string? EmploymentStatus { get; init; }
    public string? CompanyName { get; init; }
    public string? CompanyRegistrationNumber { get; init; }
    public string? CompanyAddress { get; init; }
    public string? CompanyContactNumber { get; init; }
    public string? CompanyEmail { get; init; }
}

public class AdminUpdateApplicantDetailDto
{
    public string? FirstName { get; set; }
    public string? MiddleName { get; set; }
    public string? LastName { get; set; }
    public string? Suffix { get; set; }
    public string? Sex { get; set; }
    public DateOnly? BirthDate { get; set; }
    public string? Dob { get; set; }
    public string? Nationality { get; set; }
    public string? ContactNumber { get; set; }
    public string? EmailAddress { get; set; }
    public string? Address { get; set; }
    public Guid? BarangayId { get; set; }
    public string? ZipCode { get; set; }
    public double? Height { get; set; }
    public double? Weight { get; set; }
    public string? SchoolAttended { get; set; }
    public string? CourseTaken { get; set; }
    public string? YearGraduated { get; set; }
    public string? ESignature { get; set; }
}

public class AdminUpdateCompanyDetailDto
{
    public string? Name { get; set; }
    public string? RegistrationNumber { get; set; }
    public string? Address { get; set; }
    public Guid? BarangayId { get; set; }
    public string? ContactNumber { get; set; }
    public string? Email { get; set; }
    public string? EntityType { get; set; }
}
