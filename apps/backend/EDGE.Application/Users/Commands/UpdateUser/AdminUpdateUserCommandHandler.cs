using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.Extensions.Logging;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.Users.Commands.UpdateUser;

public class AdminUpdateUserCommandHandler : IRequestHandler<AdminUpdateUserCommand, User?>
{
    private readonly IUserRepository _userRepository;
    private readonly ITenantMemberRepository _tenantMemberRepository;
    private readonly IRoleRepository _roleRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<AdminUpdateUserCommandHandler> _logger;

    public AdminUpdateUserCommandHandler(
        IUserRepository userRepository,
        ITenantMemberRepository tenantMemberRepository,
        IRoleRepository roleRepository,
        IUnitOfWork unitOfWork,
        ILogger<AdminUpdateUserCommandHandler> logger)
    {
        _userRepository = userRepository;
        _tenantMemberRepository = tenantMemberRepository;
        _roleRepository = roleRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<User?> Handle(AdminUpdateUserCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.Id, cancellationToken);
        if (user == null) return null;

        user.FirstName = request.FirstName.Trim();
        user.LastName = request.LastName.Trim();
        if (!string.IsNullOrWhiteSpace(request.Email))
        {
            user.Email = request.Email.Trim().ToLowerInvariant();
        }
        if (request.MiddleName != null) user.MiddleName = request.MiddleName.Trim();
        if (request.Suffix != null) user.Suffix = request.Suffix.Trim();
        if (request.ContactNumber != null) user.ContactNumber = request.ContactNumber.Trim();
        if (request.ESignature != null) user.ESignature = request.ESignature;
        if (request.IsSuperAdmin.HasValue)
        {
            user.IsSuperAdmin = request.IsSuperAdmin.Value;
        }

        // Update Tenant Membership if TenantId is provided
        if (request.TenantId.HasValue && request.TenantId.Value != Guid.Empty)
        {
            var membership = await _tenantMemberRepository.GetByTenantAndUserAsync(request.TenantId.Value, user.Id, cancellationToken);
            if (membership != null)
            {
                if (!string.IsNullOrWhiteSpace(request.RoleKey))
                {
                    var normalizedRoleKey = request.RoleKey.Trim().ToLowerInvariant();
                    var role = await _roleRepository.GetByKeyAsync(normalizedRoleKey, cancellationToken);
                    if (role == null)
                    {
                        var tenantRoles = await _roleRepository.GetAllByTenantAsync(request.TenantId.Value, cancellationToken);
                        role = tenantRoles.FirstOrDefault(r => r.Key.Equals(normalizedRoleKey, StringComparison.OrdinalIgnoreCase) ||
                                                               r.Name.Equals(normalizedRoleKey, StringComparison.OrdinalIgnoreCase));
                    }
                    if (role != null)
                    {
                        membership.RoleId = role.Id;
                    }
                }

                if (request.FieldOfficeId.HasValue && request.FieldOfficeId.Value != Guid.Empty)
                {
                    membership.FieldOfficeId = request.FieldOfficeId.Value;
                }
                if (request.JobTitle != null) membership.JobTitle = request.JobTitle.Trim();
                if (request.Level != null) membership.Level = request.Level.Trim();
                if (request.Division != null) membership.Division = request.Division.Trim();
                if (request.Position != null) membership.Position = request.Position.Trim();
                if (request.Designation != null) membership.Designation = request.Designation.Trim();
            }
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return user;
    }
}
