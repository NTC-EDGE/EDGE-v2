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
    string? Street = null,
    string? Unit = null,
    string? ZipCode = null,
    Guid? BarangayId = null,
    string? ESignature = null
) : IRequest<User?>;
