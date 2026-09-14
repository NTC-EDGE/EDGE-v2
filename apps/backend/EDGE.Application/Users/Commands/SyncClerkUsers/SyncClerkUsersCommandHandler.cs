using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.Extensions.Logging;
using EDGE.Application.Common.Interfaces;
using EDGE.Domain.Authorization;
using EDGE.Domain.Entities;

namespace EDGE.Application.Users.Commands.SyncClerkUsers;

public class SyncClerkUsersCommandHandler : IRequestHandler<SyncClerkUsersCommand, SyncClerkUsersResultDto>
{
    private readonly IClerkUserService _clerkUserService;
    private readonly IUserRepository _userRepository;
    private readonly ITenantMemberRepository _tenantMemberRepository;
    private readonly IRoleRepository _roleRepository;
    private readonly ITenantRepository _tenantRepository;
    private readonly IUserAuthorizationService _userAuthorizationService;
    private readonly ICurrentUserService _currentUserService;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<SyncClerkUsersCommandHandler> _logger;

    public SyncClerkUsersCommandHandler(
        IClerkUserService clerkUserService,
        IUserRepository userRepository,
        ITenantMemberRepository tenantMemberRepository,
        IRoleRepository roleRepository,
        ITenantRepository tenantRepository,
        IUserAuthorizationService userAuthorizationService,
        ICurrentUserService currentUserService,
        IUnitOfWork unitOfWork,
        ILogger<SyncClerkUsersCommandHandler> logger)
    {
        _clerkUserService = clerkUserService;
        _userRepository = userRepository;
        _tenantMemberRepository = tenantMemberRepository;
        _roleRepository = roleRepository;
        _tenantRepository = tenantRepository;
        _userAuthorizationService = userAuthorizationService;
        _currentUserService = currentUserService;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<SyncClerkUsersResultDto> Handle(SyncClerkUsersCommand request, CancellationToken cancellationToken)
    {
        // 1. Authorization Verification
        var isSuperAdminCaller = await _userAuthorizationService.HasRoleAsync("superadmin", cancellationToken);
        var hasManageUsers = await _userAuthorizationService.HasPermissionAsync(Permissions.ManageUsers, cancellationToken)
                             || await _userAuthorizationService.HasPermissionAsync(Permissions.CreateUsers, cancellationToken);

        if (!isSuperAdminCaller && !hasManageUsers)
        {
            _logger.LogWarning("Unauthorized Clerk user sync attempt by AuthUserId: {UserId}", _currentUserService.UserId);
            throw new UnauthorizedAccessException("You do not have permission to sync users from Clerk.");
        }

        // 2. Fetch all users from Clerk
        _logger.LogInformation("Initiating Clerk user synchronization...");
        var clerkUsers = await _clerkUserService.GetAllUsersAsync(500, 0, cancellationToken);

        // 3. Load DB Context data (tenants, roles, existing users)
        var allLocalUsers = await _userRepository.GetAllAsync(cancellationToken);
        var allTenants = await _tenantRepository.GetAllAsync(cancellationToken);
        var allRoles = await _roleRepository.GetAllAsync(cancellationToken);

        var defaultTenant = allTenants.FirstOrDefault(t => t.IsActive) ?? allTenants.FirstOrDefault();
        var defaultRole = allRoles.FirstOrDefault(r => r.Key.Equals("evaluator", StringComparison.OrdinalIgnoreCase))
                          ?? allRoles.FirstOrDefault(r => !r.IsSystemRole)
                          ?? allRoles.FirstOrDefault();

        var superAdminRole = allRoles.FirstOrDefault(r => r.Key.Equals("superadmin", StringComparison.OrdinalIgnoreCase)
                                                          || r.Name.Equals("Super Admin", StringComparison.OrdinalIgnoreCase));

        int createdCount = 0;
        int updatedCount = 0;
        int membershipsCreated = 0;
        var syncedSummaryList = new List<SyncedUserSummaryDto>();

        foreach (var clerkUser in clerkUsers)
        {
            var primaryEmail = clerkUser.EmailAddresses.FirstOrDefault()?.EmailAddress?.Trim().ToLowerInvariant() ?? string.Empty;
            if (string.IsNullOrWhiteSpace(primaryEmail))
            {
                continue;
            }

            var (metaIsSuperAdmin, metaRoleKey, metaTenantId) = ExtractMetadata(clerkUser.PublicMetadata);

            // Match existing user by AuthUserId or Email
            var localUser = allLocalUsers.FirstOrDefault(u => u.AuthUserId == clerkUser.Id)
                            ?? allLocalUsers.FirstOrDefault(u => u.Email.Trim().Equals(primaryEmail, StringComparison.OrdinalIgnoreCase));

            var userAction = "synced";

            if (localUser == null)
            {
                localUser = new User
                {
                    Id = Guid.NewGuid(),
                    AuthUserId = clerkUser.Id,
                    Email = primaryEmail,
                    FirstName = !string.IsNullOrWhiteSpace(clerkUser.FirstName) ? clerkUser.FirstName.Trim() : "Clerk",
                    LastName = !string.IsNullOrWhiteSpace(clerkUser.LastName) ? clerkUser.LastName.Trim() : "User",
                    IsSuperAdmin = metaIsSuperAdmin
                };

                await _userRepository.AddAsync(localUser, cancellationToken);
                allLocalUsers.Add(localUser);
                createdCount++;
                userAction = "created";
            }
            else
            {
                var wasModified = false;
                if (localUser.AuthUserId != clerkUser.Id)
                {
                    localUser.AuthUserId = clerkUser.Id;
                    wasModified = true;
                }

                if (string.IsNullOrWhiteSpace(localUser.FirstName) && !string.IsNullOrWhiteSpace(clerkUser.FirstName))
                {
                    localUser.FirstName = clerkUser.FirstName.Trim();
                    wasModified = true;
                }

                if (string.IsNullOrWhiteSpace(localUser.LastName) && !string.IsNullOrWhiteSpace(clerkUser.LastName))
                {
                    localUser.LastName = clerkUser.LastName.Trim();
                    wasModified = true;
                }

                if (metaIsSuperAdmin && !localUser.IsSuperAdmin)
                {
                    localUser.IsSuperAdmin = true;
                    wasModified = true;
                }

                if (wasModified)
                {
                    updatedCount++;
                    userAction = "updated";
                }
            }

            // Determine Target Tenant and Role for Membership
            Tenant? targetTenant = null;
            if (metaTenantId.HasValue && metaTenantId.Value != Guid.Empty)
            {
                targetTenant = allTenants.FirstOrDefault(t => t.Id == metaTenantId.Value);
            }
            if (targetTenant == null && request.AssignDefaultTenantIfMissing)
            {
                targetTenant = defaultTenant;
            }

            Role? targetRole = null;
            if (!string.IsNullOrWhiteSpace(metaRoleKey))
            {
                targetRole = allRoles.FirstOrDefault(r => r.Key.Equals(metaRoleKey.Trim(), StringComparison.OrdinalIgnoreCase));
            }
            if (targetRole == null)
            {
                targetRole = localUser.IsSuperAdmin && superAdminRole != null ? superAdminRole : defaultRole;
            }

            // Sync Tenant Membership if a target tenant is available
            if (targetTenant != null && targetRole != null)
            {
                var existingMembership = await _tenantMemberRepository.GetByTenantAndUserAsync(targetTenant.Id, localUser.Id, cancellationToken);
                if (existingMembership == null)
                {
                    var newMember = new TenantMember
                    {
                        Id = Guid.NewGuid(),
                        TenantId = targetTenant.Id,
                        UserId = localUser.Id,
                        RoleId = targetRole.Id,
                        JobTitle = targetRole.Name,
                        Position = targetRole.Name,
                        Division = "Operations"
                    };

                    await _tenantMemberRepository.AddAsync(newMember, cancellationToken);
                    membershipsCreated++;
                }
            }

            syncedSummaryList.Add(new SyncedUserSummaryDto
            {
                Id = localUser.Id,
                AuthUserId = localUser.AuthUserId,
                Email = localUser.Email,
                FirstName = localUser.FirstName,
                LastName = localUser.LastName,
                IsSuperAdmin = localUser.IsSuperAdmin,
                TenantId = targetTenant?.Id,
                TenantName = targetTenant?.Name,
                RoleKey = targetRole?.Key,
                Action = userAction
            });
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Clerk user sync completed. Total Clerk: {Total}, Created: {Created}, Updated: {Updated}, Memberships: {Memberships}",
            clerkUsers.Count, createdCount, updatedCount, membershipsCreated);

        return new SyncClerkUsersResultDto
        {
            TotalClerkUsers = clerkUsers.Count,
            CreatedUsers = createdCount,
            UpdatedUsers = updatedCount,
            TenantMembershipsCreated = membershipsCreated,
            Message = $"Successfully synchronized {clerkUsers.Count} Clerk users ({createdCount} newly created, {updatedCount} updated, {membershipsCreated} memberships established).",
            SyncedUsers = syncedSummaryList
        };
    }

    private static (bool IsSuperAdmin, string? RoleKey, Guid? TenantId) ExtractMetadata(JsonElement? metadata)
    {
        if (!metadata.HasValue || metadata.Value.ValueKind != JsonValueKind.Object)
        {
            return (false, null, null);
        }

        var elem = metadata.Value;
        bool isSuperAdmin = false;
        string? roleKey = null;
        Guid? tenantId = null;

        if (elem.TryGetProperty("is_super_admin", out var isa))
        {
            if (isa.ValueKind == JsonValueKind.True) isSuperAdmin = true;
            else if (isa.ValueKind == JsonValueKind.String && bool.TryParse(isa.GetString(), out var parsedBool)) isSuperAdmin = parsedBool;
        }

        if (elem.TryGetProperty("role", out var r) && r.ValueKind == JsonValueKind.String)
        {
            roleKey = r.GetString();
            if (roleKey != null && roleKey.Equals("superadmin", StringComparison.OrdinalIgnoreCase))
            {
                isSuperAdmin = true;
            }
        }

        if (elem.TryGetProperty("tenant_id", out var t) && t.ValueKind == JsonValueKind.String)
        {
            if (Guid.TryParse(t.GetString(), out var tid))
            {
                tenantId = tid;
            }
        }

        return (isSuperAdmin, roleKey, tenantId);
    }
}
