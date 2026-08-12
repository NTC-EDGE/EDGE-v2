using System;
using System.Collections.Generic;
using MediatR;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Applications.Commands.AdminUpdateApplication;

public record AdminUpdateApplicationCommand : IRequest<ApiResponse<Guid>>
{
    public Guid Id { get; init; }
    public string? ReferenceNumber { get; init; }
    public string? PermitNumber { get; init; }
    public string? Office { get; init; }
    public string? Applicant { get; init; }
    public string? ApplicantType { get; init; }
    public string? Note { get; init; }
    public AdminUpdateContactDetailsDto? ContactDetails { get; init; }
    public AdminUpdateAddressDto? Address { get; init; }
    public AdminUpdateCompanyDetailsDto? CompanyDetails { get; init; }
    public AdminUpdateBasicInfoDto? BasicInfo { get; init; }
    public List<AdminUpdateRosterItemDto>? ApplicantsList { get; init; }
}

public record AdminUpdateContactDetailsDto(string? Email, string? ContactNumber);
public record AdminUpdateAddressDto(string? Barangay, string? Province, string? City, string? ZipCode);
public record AdminUpdateCompanyDetailsDto(string? Name, string? RegistrationNumber, string? Address, string? ContactNumber, string? Email);
public record AdminUpdateBasicInfoDto(string? LastName, string? FirstName, string? MiddleName, string? ExtensionName, string? PlaceOfBirth, string? Dob, string? Sex, double? Weight, double? Height, string? Nationality, string? EmploymentStatus);
public record AdminUpdateRosterItemDto(string? Id, string? Name, string? ApplicantType, string? Status, string? EvaluationRemarks, string? Email);
