using System;
using MediatR;
using EDGE.Application.Applicants.Dtos;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Applicants.Commands.UpdateApplicantDetail;

public record UpdateApplicantDetailCommand(
    Guid Id,
    Guid? BarangayId,
    string? Address,
    string? FirstName,
    string? MiddleName,
    string? LastName,
    string? Suffix,
    string? Nationality,
    string? Sex,
    double? Height,
    double? Weight,
    DateOnly? BirthDate,
    string? ContactNumber,
    string? ZipCode,
    string? SchoolAttended,
    string? CourseTaken,
    string? YearGraduated,
    string? ESignature,
    string? CompanyName,
    string? CompanyRegistrationNumber,
    string? CompanyContactNumber,
    string? CompanyEmail,
    string? CompanyEntityType
) : IRequest<ApiResponse<ApplicantDto>>;
