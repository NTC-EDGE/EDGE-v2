using System;
using System.Linq;
using System.Security.Cryptography;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.Extensions.Logging;
using EDGE.Application.Common.Interfaces;
using EDGE.Domain.Authorization;
using EDGE.Domain.Entities;

namespace EDGE.Application.Users.Commands.AdminCreateUser;

public class AdminCreateUserCommandHandler : IRequestHandler<AdminCreateUserCommand, AdminCreateUserResultDto>
{
    private readonly IClerkUserService _clerkUserService;
    private readonly IUserRepository _userRepository;
    private readonly ITenantMemberRepository _tenantMemberRepository;
    private readonly IRoleRepository _roleRepository;
    private readonly ITenantRepository _tenantRepository;
    private readonly ITenantContextService _tenantContextService;
    private readonly ICurrentUserService _currentUserService;
    private readonly IUserAuthorizationService _userAuthorizationService;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<AdminCreateUserCommandHandler> _logger;

    public AdminCreateUserCommandHandler(
        IClerkUserService clerkUserService,
        IUserRepository userRepository,
        ITenantMemberRepository tenantMemberRepository,
        IRoleRepository roleRepository,
        ITenantRepository tenantRepository,
        ITenantContextService tenantContextService,
        ICurrentUserService currentUserService,
        IUserAuthorizationService userAuthorizationService,
        IUnitOfWork unitOfWork,
        ILogger<AdminCreateUserCommandHandler> logger)
    {
        _clerkUserService = clerkUserService;
        _userRepository = userRepository;
        _tenantMemberRepository = tenantMemberRepository;
        _roleRepository = roleRepository;
        _tenantRepository = tenantRepository;
        _tenantContextService = tenantContextService;
        _currentUserService = currentUserService;
        _userAuthorizationService = userAuthorizationService;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<AdminCreateUserResultDto> Handle(AdminCreateUserCommand request, CancellationToken cancellationToken)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var normalizedRoleKey = (request.RoleKey ?? SystemRoles.Evaluator).Trim().ToLowerInvariant();

        // 1. Authorization Verification
        var isSuperAdminCaller = await _userAuthorizationService.HasRoleAsync(SystemRoles.SuperAdmin, cancellationToken);
        var hasManageUsersPermission = await _userAuthorizationService.HasPermissionAsync(Permissions.ManageUsers, cancellationToken)
                                       || await _userAuthorizationService.HasPermissionAsync(Permissions.CreateUsers, cancellationToken);

        if (!isSuperAdminCaller && !hasManageUsersPermission)
        {
            _logger.LogWarning("Unauthorized user creation attempt by AuthUserId: {UserId}", _currentUserService.UserId);
            throw new UnauthorizedAccessException("You do not have permission to create users.");
        }

        // Only SuperAdmins can create SuperAdmin accounts
        if (request.IsSuperAdmin && !isSuperAdminCaller)
        {
            throw new UnauthorizedAccessException("Only Super Administrators can create or grant SuperAdmin privileges.");
        }

        // 2. Resolve Target Tenant
        Tenant? targetTenant = null;
        if (request.TenantId.HasValue && request.TenantId.Value != Guid.Empty)
        {
            targetTenant = await _tenantRepository.GetByIdAsync(request.TenantId.Value, cancellationToken);
        }
        else if (_tenantContextService.TenantId.HasValue && _tenantContextService.TenantId.Value != Guid.Empty)
        {
            targetTenant = await _tenantRepository.GetByIdAsync(_tenantContextService.TenantId.Value, cancellationToken);
        }

        if (targetTenant == null && isSuperAdminCaller)
        {
            var allTenants = await _tenantRepository.GetAllAsync(cancellationToken);
            targetTenant = allTenants.FirstOrDefault(t => t.IsActive) ?? allTenants.FirstOrDefault();
        }

        if (targetTenant == null)
        {
            throw new InvalidOperationException("No valid or active tenant found in the system. Please specify a valid TenantId.");
        }

        var targetTenantId = targetTenant.Id;

        // Ensure non-SuperAdmin callers can only create members in their own active tenant
        await _tenantContextService.EnsureUserActiveMemberAsync(
            targetTenantId,
            "You are only authorized to create and assign users for your own regional tenant.",
            cancellationToken);

        // 3. Resolve Role
        var role = await _roleRepository.GetByKeyAsync(normalizedRoleKey, cancellationToken);
        if (role == null)
        {
            var tenantRoles = await _roleRepository.GetAllByTenantAsync(targetTenantId, cancellationToken);
            role = tenantRoles.FirstOrDefault(r => r.Key.Equals(normalizedRoleKey, StringComparison.OrdinalIgnoreCase) ||
                                                   r.Name.Equals(normalizedRoleKey, StringComparison.OrdinalIgnoreCase));
            if (role == null)
            {
                var allRoles = await _roleRepository.GetAllAsync(cancellationToken);
                role = allRoles.FirstOrDefault(r => r.Key.Equals(normalizedRoleKey, StringComparison.OrdinalIgnoreCase) ||
                                                   r.Name.Equals(normalizedRoleKey, StringComparison.OrdinalIgnoreCase));
            }

            if (role == null)
            {
                throw new InvalidOperationException($"Specified role '{request.RoleKey}' was not found in the system.");
            }
        }

        // 4. Dispatch Clerk Email Invitation (if enabled)
        var redirectUrl = !string.IsNullOrWhiteSpace(request.RedirectUrl)
            ? request.RedirectUrl
            : "http://localhost:8081";
        var invitationSent = false;

        if (request.SendInvitation)
        {
            try
            {
                var invitation = await _clerkUserService.CreateInvitationAsync(new CreateClerkInvitationPayload
                {
                    EmailAddress = normalizedEmail,
                    PublicMetadata = new
                    {
                        role = role.Key,
                        tenant_id = targetTenantId.ToString(),
                        is_super_admin = request.IsSuperAdmin
                    },
                    RedirectUrl = redirectUrl,
                    Notify = true,
                    IgnoreExisting = true
                });
                invitationSent = true;
                _logger.LogInformation("Clerk invitation sent successfully to: {Email} with RedirectUrl: {RedirectUrl}", normalizedEmail, redirectUrl);
            }
            catch (InvalidOperationException ex) when (ex.Message.Contains("form_identifier_exists", StringComparison.OrdinalIgnoreCase) ||
                                                       ex.Message.Contains("already exists", StringComparison.OrdinalIgnoreCase))
            {
                _logger.LogInformation("Clerk invitation skipped: User {Email} is already registered.", normalizedEmail);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to dispatch Clerk invitation email to: {Email}. Proceeding with user provisioning.", normalizedEmail);
            }
        }

        // 5. Create or Retrieve User in Clerk
        var existingClerkUsers = await _clerkUserService.GetUsersByEmailAsync(normalizedEmail);
        var clerkUser = existingClerkUsers.FirstOrDefault();

        if (clerkUser == null)
        {
            var rawPassword = !string.IsNullOrWhiteSpace(request.Password)
                ? request.Password
                : GenerateSecureTemporaryPassword();

            var clerkPayload = new CreateClerkUserPayload
            {
                EmailAddress = normalizedEmail,
                Username = GenerateSafeClerkUsername(request.FirstName, request.LastName, normalizedEmail),
                FirstName = request.FirstName.Trim(),
                LastName = request.LastName.Trim(),
                Password = rawPassword,
                PublicMetadata = new
                {
                    role = role.Key,
                    tenant_id = targetTenantId.ToString(),
                    is_super_admin = request.IsSuperAdmin
                }
            };

            try
            {
                clerkUser = await _clerkUserService.CreateUserAsync(clerkPayload);
                _logger.LogInformation("Successfully created Clerk user with Id: {ClerkId} for email: {Email}", clerkUser.Id, normalizedEmail);
            }
            catch (InvalidOperationException ex) when (ex.Message.Contains("form_identifier_exists", StringComparison.OrdinalIgnoreCase) ||
                                                       ex.Message.Contains("form_identifier_not_unique", StringComparison.OrdinalIgnoreCase) ||
                                                       ex.Message.Contains("already exists", StringComparison.OrdinalIgnoreCase) ||
                                                       ex.Message.Contains("already taken", StringComparison.OrdinalIgnoreCase))
            {
                _logger.LogWarning("User already exists in Clerk, retrieving user record for email: {Email}", normalizedEmail);
                existingClerkUsers = await _clerkUserService.GetUsersByEmailAsync(normalizedEmail);
                clerkUser = existingClerkUsers.FirstOrDefault();
                if (clerkUser == null)
                {
                    throw;
                }
            }
        }
        else
        {
            _logger.LogInformation("Reusing existing Clerk user with Id: {ClerkId} for email: {Email}", clerkUser.Id, normalizedEmail);
            await _clerkUserService.UpdateUserMetadataAsync(clerkUser.Id, new UserMetadataPayload
            {
                PublicMetadata = new
                {
                    role = role.Key,
                    tenant_id = targetTenantId.ToString(),
                    is_super_admin = request.IsSuperAdmin
                }
            });
        }

        // 6. Create or Update Local Database User
        var user = await _userRepository.GetByEmailAsync(normalizedEmail, cancellationToken);

        if (user == null)
        {
            user = new User
            {
                Id = Guid.NewGuid(),
                AuthUserId = clerkUser.Id,
                Email = normalizedEmail,
                FirstName = request.FirstName.Trim(),
                LastName = request.LastName.Trim(),
                MiddleName = request.MiddleName?.Trim(),
                Suffix = request.Suffix?.Trim(),
                ContactNumber = request.ContactNumber?.Trim(),
                ESignature = request.ESignature,
                IsSuperAdmin = request.IsSuperAdmin
            };
            await _userRepository.AddAsync(user, cancellationToken);
        }
        else
        {
            user.AuthUserId = clerkUser.Id;
            user.FirstName = request.FirstName.Trim();
            user.LastName = request.LastName.Trim();
            if (!string.IsNullOrWhiteSpace(request.MiddleName)) user.MiddleName = request.MiddleName.Trim();
            if (!string.IsNullOrWhiteSpace(request.Suffix)) user.Suffix = request.Suffix.Trim();
            if (!string.IsNullOrWhiteSpace(request.ContactNumber)) user.ContactNumber = request.ContactNumber.Trim();
            if (!string.IsNullOrWhiteSpace(request.ESignature)) user.ESignature = request.ESignature;
            if (isSuperAdminCaller) user.IsSuperAdmin = request.IsSuperAdmin;
        }

        // 7. Create or Update Tenant Membership
        var existingMembership = await _tenantMemberRepository.GetByTenantAndUserAsync(targetTenantId, user.Id, cancellationToken);
        if (existingMembership == null)
        {
            var member = new TenantMember
            {
                Id = Guid.NewGuid(),
                TenantId = targetTenantId,
                UserId = user.Id,
                RoleId = role.Id,
                FieldOfficeId = request.FieldOfficeId,
                JobTitle = request.JobTitle?.Trim(),
                Level = request.Level?.Trim(),
                Division = request.Division?.Trim() ?? string.Empty,
                Position = request.Position?.Trim() ?? string.Empty,
                Designation = request.Designation?.Trim()
            };
            await _tenantMemberRepository.AddAsync(member, cancellationToken);
        }
        else
        {
            existingMembership.RoleId = role.Id;
            if (request.FieldOfficeId.HasValue) existingMembership.FieldOfficeId = request.FieldOfficeId.Value;
            if (!string.IsNullOrWhiteSpace(request.JobTitle)) existingMembership.JobTitle = request.JobTitle.Trim();
            if (!string.IsNullOrWhiteSpace(request.Level)) existingMembership.Level = request.Level.Trim();
            if (!string.IsNullOrWhiteSpace(request.Division)) existingMembership.Division = request.Division.Trim();
            if (!string.IsNullOrWhiteSpace(request.Position)) existingMembership.Position = request.Position.Trim();
            if (!string.IsNullOrWhiteSpace(request.Designation)) existingMembership.Designation = request.Designation.Trim();
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new AdminCreateUserResultDto
        {
            Id = user.Id,
            AuthUserId = user.AuthUserId,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            MiddleName = user.MiddleName,
            Suffix = user.Suffix,
            ContactNumber = user.ContactNumber,
            RoleKey = role.Key,
            TenantId = targetTenantId,
            FieldOfficeId = request.FieldOfficeId,
            JobTitle = request.JobTitle,
            Level = request.Level,
            Division = request.Division,
            Position = request.Position,
            Designation = request.Designation,
            IsSuperAdmin = user.IsSuperAdmin,
            InvitationSent = invitationSent,
            CreatedAt = user.CreatedAt
        };
    }

    private static string GenerateSecureTemporaryPassword()
    {
        var randomBytes = new byte[8];
        RandomNumberGenerator.Fill(randomBytes);
        var randomSuffix = Convert.ToHexString(randomBytes)[..8];
        return $"NtcStaff_{randomSuffix}!";
    }

    private static string GenerateSafeClerkUsername(string firstName, string lastName, string email)
    {
        var cleanFirst = new string(firstName.Where(char.IsLetterOrDigit).ToArray()).ToLowerInvariant();
        var cleanLast = new string(lastName.Where(char.IsLetterOrDigit).ToArray()).ToLowerInvariant();

        string baseName;
        if (!string.IsNullOrWhiteSpace(cleanFirst) && !string.IsNullOrWhiteSpace(cleanLast))
        {
            baseName = $"{cleanFirst}_{cleanLast}";
        }
        else if (!string.IsNullOrWhiteSpace(cleanFirst))
        {
            baseName = cleanFirst;
        }
        else
        {
            var emailPrefix = email.Split('@')[0];
            baseName = new string(emailPrefix.Where(char.IsLetterOrDigit).ToArray()).ToLowerInvariant();
        }

        if (string.IsNullOrWhiteSpace(baseName) || baseName.Length < 3)
        {
            baseName = "user";
        }

        var randomSuffix = Guid.NewGuid().ToString("N")[..6];
        var username = $"{baseName}_{randomSuffix}";

        if (username.Length > 64)
        {
            username = username[..64];
        }

        return username;
    }
}
