using System;
using MediatR;

namespace EDGE.Application.Users.Commands.AdminCreateUser;

public record AdminCreateUserCommand(
    string Email,
    string FirstName,
    string LastName,
    string? MiddleName = null,
    string? Suffix = null,
    string? ContactNumber = null,
    string? Password = null,
    string? RoleKey = "evaluator",
    Guid? TenantId = null,
    Guid? FieldOfficeId = null,
    string? JobTitle = null,
    string? Level = null,
    string? Division = null,
    string? Position = null,
    string? Designation = null,
    string? ESignature = null,
    bool IsSuperAdmin = false,
    bool SendInvitation = true,
    string? RedirectUrl = null
) : IRequest<AdminCreateUserResultDto>;
