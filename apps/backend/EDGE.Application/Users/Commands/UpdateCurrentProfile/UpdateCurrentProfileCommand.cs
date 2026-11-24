using System;
using MediatR;
using EDGE.Domain.Entities;

namespace EDGE.Application.Users.Commands.UpdateCurrentProfile;

public record UpdateCurrentProfileCommand(
    string? FirstName = null,
    string? LastName = null,
    string? MiddleName = null,
    string? Suffix = null,
    string? ContactNumber = null,
    DateTime? DateOfBirth = null,
    string? Sex = null,
    string? Nationality = null,
    float? Height = null,
    float? Weight = null,
    string? SchoolAttended = null,
    string? CourseTaken = null,
    string? Street = null,
    string? Unit = null,
    string? ZipCode = null,
    Guid? BarangayId = null,
    string? ESignature = null,
    string? CompanyName = null,
    string? CompanyRegistrationNumber = null,
    string? CompanyAddress = null,
    string? CompanyContactNumber = null,
    string? CompanyEmail = null
) : IRequest<User?>;
