using MediatR;
using EDGE.Domain.Entities;

namespace EDGE.Application.Users.Commands.UpdateUser;

public record AdminUpdateUserCommand(
    Guid Id,
    string FirstName,
    string LastName,
    string? Email = null,
    string? MiddleName = null,
    string? Suffix = null,
    string? ContactNumber = null,
    string? RoleKey = null,
    Guid? TenantId = null,
    Guid? FieldOfficeId = null,
    string? JobTitle = null,
    string? Level = null,
    string? Division = null,
    string? Position = null,
    string? Designation = null,
    string? ESignature = null,
    bool? IsSuperAdmin = null
) : IRequest<User?>;
