using System;
using MediatR;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Applications.Commands.AdminUpdateApplicantProfile;

public record AdminUpdateApplicantProfileCommand : IRequest<ApiResponse<Guid>>
{
    public Guid ApplicationId { get; init; }
    public Guid ApplicantId { get; init; }
    public string? FirstName { get; init; }
    public string? LastName { get; init; }
    public string? MiddleName { get; init; }
    public string? Suffix { get; init; }
    public string? ApplicantType { get; init; }
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
