using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.Extensions.Logging;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Domain.Entities;
using EDGE.Domain.Authorization;

namespace EDGE.Application.Auth.Commands.VerifyStaffSession;

public class VerifyStaffSessionCommandHandler : IRequestHandler<VerifyStaffSessionCommand, ApiResponse<VerifyStaffSessionDto>>
{
    private readonly ICurrentUserService _currentUserService;
    private readonly IUserRepository _userRepository;
    private readonly ITenantMemberRepository _tenantMemberRepository;
    private readonly ITenantRepository _tenantRepository;
    private readonly IGeographicRepository _geographicRepository;
    private readonly IRoleRepository _roleRepository;
    private readonly IRolePermissionRepository _rolePermissionRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<VerifyStaffSessionCommandHandler>? _logger;

    public VerifyStaffSessionCommandHandler(
        ICurrentUserService currentUserService,
        IUserRepository userRepository,
        ITenantMemberRepository tenantMemberRepository,
        ITenantRepository tenantRepository,
        IGeographicRepository geographicRepository,
        IRoleRepository roleRepository,
        IRolePermissionRepository rolePermissionRepository,
        IUnitOfWork unitOfWork,
        ILogger<VerifyStaffSessionCommandHandler>? logger = null)
    {
        _currentUserService = currentUserService;
        _userRepository = userRepository;
        _tenantMemberRepository = tenantMemberRepository;
        _tenantRepository = tenantRepository;
        _geographicRepository = geographicRepository;
        _roleRepository = roleRepository;
        _rolePermissionRepository = rolePermissionRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<ApiResponse<VerifyStaffSessionDto>> Handle(
        VerifyStaffSessionCommand request,
        CancellationToken cancellationToken)
    {
        var rawUserId = _currentUserService.UserId;
        var selectedRegionInput = request.SelectedRegion.Trim();

        // 1. Fetch available administrative regions to compare codes and names
        var allRegions = await _geographicRepository.GetRegionsAsync(activeOnly: true, cancellationToken) ?? new List<Region>();
        var targetRegion = allRegions.FirstOrDefault(r =>
            string.Equals(r.Code, selectedRegionInput, StringComparison.OrdinalIgnoreCase) ||
            string.Equals(r.Name, selectedRegionInput, StringComparison.OrdinalIgnoreCase) ||
            selectedRegionInput.StartsWith(r.Code, StringComparison.OrdinalIgnoreCase) ||
            selectedRegionInput.Contains(r.Name, StringComparison.OrdinalIgnoreCase)
        ) ?? allRegions.FirstOrDefault(r => string.Equals(r.Code, "NCR", StringComparison.OrdinalIgnoreCase));

        var regionCode = targetRegion?.Code ?? (!string.IsNullOrWhiteSpace(selectedRegionInput) ? selectedRegionInput : "NCR");
        var regionName = targetRegion?.Name ?? (regionCode.Equals("NCR", StringComparison.OrdinalIgnoreCase) ? "National Capital Region" : $"Region {regionCode}");

        // 2. Resolve Authenticated User and Database Record
        User? user = null;
        if (!string.IsNullOrEmpty(rawUserId))
        {
            user = await _userRepository.GetByAuthUserIdAsync(rawUserId, cancellationToken);
            if (user == null && Guid.TryParse(rawUserId, out var parsedUserId))
            {
                user = await _userRepository.GetByIdAsync(parsedUserId, cancellationToken);
            }

            // Fallback: If user logged in via Clerk whose email matches an existing database user, link AuthUserId if email is verified & unlinked/seed
            if (user == null && !string.IsNullOrWhiteSpace(_currentUserService.Email))
            {
                if (_currentUserService.IsEmailVerified)
                {
                    var cleanEmail = _currentUserService.Email.Trim().ToLowerInvariant();
                    var candidateUser = await _userRepository.GetByEmailAsync(cleanEmail, cancellationToken);
                    if (candidateUser != null)
                    {
                        var isUnlinkedOrSeed = string.IsNullOrWhiteSpace(candidateUser.AuthUserId) ||
                                               candidateUser.AuthUserId.EndsWith("123") ||
                                               candidateUser.AuthUserId.EndsWith("34") ||
                                               candidateUser.AuthUserId.StartsWith("seed_") ||
                                               candidateUser.AuthUserId.StartsWith("temp_");

                        if (isUnlinkedOrSeed)
                        {
                            candidateUser.AuthUserId = rawUserId;
                            await _unitOfWork.SaveChangesAsync(cancellationToken);
                            user = candidateUser;
                            _logger?.LogInformation("Auto-linked verified staff account '{Email}' to AuthUserId '{AuthUserId}'", cleanEmail, rawUserId);
                        }
                        else
                        {
                            _logger?.LogWarning("Account collision safeguard: Incoming AuthUserId '{AuthUserId}' with email '{Email}' was prevented from taking over account already linked to '{ExistingAuthUserId}'",
                                rawUserId, cleanEmail, candidateUser.AuthUserId);
                        }
                    }
                }
                else
                {
                    _logger?.LogWarning("Skipping staff auto-linking for AuthUserId '{AuthUserId}' because email '{Email}' is unverified.",
                        rawUserId, _currentUserService.Email);
                }
            }

            if (user == null)
            {
                return ApiResponse<VerifyStaffSessionDto>.Fail(
                    "The selected account is not yet registered. Please make sure to sign in with a registered account."
                );
            }
        }

        var allTenants = await _tenantRepository.GetAllAsync(cancellationToken) ?? new List<Tenant>();
        Tenant? resolvedTenant = null;
        TenantMember? matchingMembership = null;

        if (user != null)
        {
            var userMemberships = await _tenantMemberRepository.GetMembersByUserAsync(user.Id, cancellationToken) ?? new List<TenantMember>();
            if (userMemberships.Count == 0 && !user.IsSuperAdmin)
            {
                return ApiResponse<VerifyStaffSessionDto>.Fail(
                    "The selected account is not yet assigned to any Regional Office. Please make sure to sign in with an authorized account or contact your administrator."
                );
            }

            if (userMemberships.Count > 0)
            {
                // Find membership matching the selected region or tenant code/name
                matchingMembership = userMemberships.FirstOrDefault(m =>
                {
                    var t = allTenants.FirstOrDefault(tenant => tenant.Id == m.TenantId);
                    if (t == null) return false;
                    if (targetRegion != null && t.RegionId != Guid.Empty && t.RegionId == targetRegion.Id) return true;
                    return string.Equals(t.Code, selectedRegionInput, StringComparison.OrdinalIgnoreCase) ||
                           string.Equals(t.Name, selectedRegionInput, StringComparison.OrdinalIgnoreCase);
                });

                if (matchingMembership == null && !user.IsSuperAdmin)
                {
                    // User has assigned region(s) but selected an unassigned region
                    var firstAssignedTenant = allTenants.FirstOrDefault(t => t.Id == userMemberships[0].TenantId);
                    var firstAssignedRegion = firstAssignedTenant != null && firstAssignedTenant.RegionId != Guid.Empty
                        ? allRegions.FirstOrDefault(r => r.Id == firstAssignedTenant.RegionId)
                        : null;

                    var assignedRegionLabel = firstAssignedRegion != null
                        ? $"{firstAssignedRegion.Code} - {firstAssignedRegion.Name}"
                        : firstAssignedTenant?.Name ?? "an assigned region";

                    return ApiResponse<VerifyStaffSessionDto>.Fail(
                        $"Access Denied: Your staff account is assigned to Regional Office '{assignedRegionLabel}'. You cannot log into '{request.SelectedRegion}'."
                    );
                }

                if (matchingMembership != null)
                {
                    resolvedTenant = allTenants.FirstOrDefault(t => t.Id == matchingMembership.TenantId);
                }
            }
        }

        if (resolvedTenant == null && targetRegion != null)
        {
            resolvedTenant = allTenants.FirstOrDefault(t => t.RegionId == targetRegion.Id && t.IsActive)
                          ?? allTenants.FirstOrDefault(t => t.RegionId == targetRegion.Id);
        }

        if (resolvedTenant == null)
        {
            var defaultTenantId = Guid.Parse("00000000-0000-0000-0000-000000000001");
            resolvedTenant = allTenants.FirstOrDefault(t => t.Id == defaultTenantId)
                          ?? allTenants.FirstOrDefault(t => t.IsActive)
                          ?? allTenants.FirstOrDefault();
        }

        var finalTenantId = resolvedTenant?.Id ?? Guid.Parse("00000000-0000-0000-0000-000000000001");
        var finalTenantName = resolvedTenant?.Name ?? $"NTC Regional Office - {regionCode}";

        // 3. Resolve user's actual assigned Role and Permissions
        var assignedRoleNames = new List<string>();
        var effectivePermissions = new List<string>();

        var systemRoles = await _roleRepository.GetAllAsync(cancellationToken) ?? new List<Role>();
        Role? resolvedRole = null;
        if (matchingMembership != null && matchingMembership.RoleId != Guid.Empty)
        {
            resolvedRole = matchingMembership.Role ?? await _roleRepository.GetByIdAsync(matchingMembership.RoleId, cancellationToken);
        }

        if (resolvedRole == null && user != null && user.IsSuperAdmin)
        {
            resolvedRole = systemRoles.FirstOrDefault(r => r.Key == "superadmin" || r.Key == "super_admin" || r.Name == "Super Administrator" || r.Key == "admin");
        }

        if (resolvedRole == null)
        {
            resolvedRole = systemRoles.FirstOrDefault(r => r.Key == "admin" || r.Name == "Administrator")
                        ?? systemRoles.FirstOrDefault();
        }

        if (resolvedRole != null)
        {
            assignedRoleNames.Add(resolvedRole.Name);
            var rolePerms = await _rolePermissionRepository.GetPermissionKeysForRoleAsync(resolvedRole.Id, cancellationToken);
            if (rolePerms != null && rolePerms.Count > 0)
            {
                effectivePermissions.AddRange(rolePerms);
            }
            else
            {
                effectivePermissions.AddRange(Permissions.AllKeys);
            }
        }
        else
        {
            assignedRoleNames.Add("Administrator");
            effectivePermissions.AddRange(Permissions.AllKeys);
        }

        var dto = new VerifyStaffSessionDto(
            UserId: user?.Id ?? (!string.IsNullOrEmpty(rawUserId) && Guid.TryParse(rawUserId, out var uid) ? uid : Guid.NewGuid()),
            Email: user?.Email ?? "staff@ntc.gov.ph",
            TenantId: finalTenantId,
            TenantName: finalTenantName,
            RegionCode: regionCode,
            RegionName: regionName,
            IsAuthorized: true,
            AssignedRoles: assignedRoleNames,
            EffectivePermissions: effectivePermissions.Distinct().ToList()
        );

        return ApiResponse<VerifyStaffSessionDto>.Success(dto, "Staff tenant membership verified successfully.");
    }
}
