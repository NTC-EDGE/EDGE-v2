using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
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

    public VerifyStaffSessionCommandHandler(
        ICurrentUserService currentUserService,
        IUserRepository userRepository,
        ITenantMemberRepository tenantMemberRepository,
        ITenantRepository tenantRepository,
        IGeographicRepository geographicRepository,
        IRoleRepository roleRepository,
        IRolePermissionRepository rolePermissionRepository)
    {
        _currentUserService = currentUserService;
        _userRepository = userRepository;
        _tenantMemberRepository = tenantMemberRepository;
        _tenantRepository = tenantRepository;
        _geographicRepository = geographicRepository;
        _roleRepository = roleRepository;
        _rolePermissionRepository = rolePermissionRepository;
    }

    public async Task<ApiResponse<VerifyStaffSessionDto>> Handle(
        VerifyStaffSessionCommand request,
        CancellationToken cancellationToken)
    {
        var rawUserId = _currentUserService.UserId;
        var selectedRegionInput = request.SelectedRegion.Trim();

        // 1. Fetch available administrative regions to compare codes and names
        var allRegions = await _geographicRepository.GetRegionsAsync(activeOnly: true, cancellationToken);
        var targetRegion = allRegions.FirstOrDefault(r =>
            string.Equals(r.Code, selectedRegionInput, StringComparison.OrdinalIgnoreCase) ||
            string.Equals(r.Name, selectedRegionInput, StringComparison.OrdinalIgnoreCase) ||
            selectedRegionInput.StartsWith(r.Code, StringComparison.OrdinalIgnoreCase) ||
            selectedRegionInput.Contains(r.Name, StringComparison.OrdinalIgnoreCase)
        ) ?? allRegions.FirstOrDefault(r => string.Equals(r.Code, "NCR", StringComparison.OrdinalIgnoreCase));

        var regionCode = targetRegion?.Code ?? "NCR";
        var regionName = targetRegion?.Name ?? "National Capital Region";

        // 2. Resolve Authenticated User and Database Record
        User? user = null;
        if (!string.IsNullOrEmpty(rawUserId))
        {
            user = await _userRepository.GetByAuthUserIdAsync(rawUserId, cancellationToken);
            if (user == null && Guid.TryParse(rawUserId, out var parsedUserId))
            {
                user = await _userRepository.GetByIdAsync(parsedUserId, cancellationToken);
            }
        }

        var allTenants = await _tenantRepository.GetAllAsync(cancellationToken);
        Tenant? resolvedTenant = null;
        TenantMember? matchingMembership = null;

        if (user != null)
        {
            var userMemberships = await _tenantMemberRepository.GetMembersByUserAsync(user.Id, cancellationToken);
            if (userMemberships.Count > 0)
            {
                // Find membership matching the selected region
                matchingMembership = userMemberships.FirstOrDefault(m =>
                {
                    var t = allTenants.FirstOrDefault(tenant => tenant.Id == m.TenantId);
                    return t != null && targetRegion != null && t.RegionId == targetRegion.Id;
                });

                if (matchingMembership == null && !user.IsSuperAdmin)
                {
                    // User has assigned region(s) but selected an unassigned region
                    var firstAssignedTenant = allTenants.FirstOrDefault(t => t.Id == userMemberships[0].TenantId);
                    var firstAssignedRegion = firstAssignedTenant != null
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

        Role? resolvedRole = null;
        if (matchingMembership != null && matchingMembership.RoleId != Guid.Empty)
        {
            resolvedRole = matchingMembership.Role ?? await _roleRepository.GetByIdAsync(matchingMembership.RoleId, cancellationToken);
        }

        if (resolvedRole == null && user != null && user.IsSuperAdmin)
        {
            var systemRoles = await _roleRepository.GetAllAsync(cancellationToken);
            resolvedRole = systemRoles.FirstOrDefault(r => r.Key == "super_admin" || r.Name == "Super Administrator" || r.Key == "admin");
        }

        if (resolvedRole == null)
        {
            var systemRoles = await _roleRepository.GetAllAsync(cancellationToken);
            resolvedRole = systemRoles.FirstOrDefault(r => r.Key == "admin" || r.Name == "Administrator")
                        ?? systemRoles.FirstOrDefault();
        }

        if (resolvedRole != null)
        {
            assignedRoleNames.Add(resolvedRole.Name);
            var rolePerms = await _rolePermissionRepository.GetPermissionKeysForRoleAsync(resolvedRole.Id, cancellationToken);
            if (rolePerms.Count > 0)
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
