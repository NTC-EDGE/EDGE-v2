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
using EDGE.Domain.Constants;

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
        if (string.IsNullOrWhiteSpace(rawUserId))
        {
            return ApiResponse<VerifyStaffSessionDto>.Fail(
                "Authentication required. No valid user identity was found in the session."
            );
        }

        var user = await _userRepository.ResolveCurrentUserAsync(_currentUserService, cancellationToken);
        if (user == null)
        {
            return ApiResponse<VerifyStaffSessionDto>.Fail(
                "The selected account is not yet registered. Please make sure to sign in with a registered account."
            );
        }

        var allTenants = await _tenantRepository.GetAllAsync(cancellationToken) ?? new List<Tenant>();
        Tenant? resolvedTenant = null;
        TenantMember? matchingMembership = null;

        var isSuperAdmin = user.IsSuperAdmin ||
                           _currentUserService.IsSuperAdminClaim ||
                           AdministrativeIdentityPolicy.IsSuperAdminEmail(user.Email) ||
                           AdministrativeIdentityPolicy.IsSuperAdminEmail(_currentUserService.Email);

        if (user != null)
        {
            var rawUserMemberships = await _tenantMemberRepository.GetMembersByUserAsync(user.Id, cancellationToken) ?? new List<TenantMember>();
            var userMemberships = rawUserMemberships.Where(m => !m.IsDeleted).ToList();

            if (userMemberships.Count == 0 && !isSuperAdmin)
            {
                return ApiResponse<VerifyStaffSessionDto>.Fail(
                    "The selected account is not yet assigned to any Regional Office. Please make sure to sign in with an authorized account or contact your administrator."
                );
            }

            if (userMemberships.Count > 0)
            {
                var isAutoSelectRequest = string.IsNullOrWhiteSpace(selectedRegionInput) ||
                                          string.Equals(selectedRegionInput, "AUTO", StringComparison.OrdinalIgnoreCase);

                var activeMemberships = userMemberships
                    .Where(m =>
                    {
                        var t = allTenants.FirstOrDefault(tenant => tenant.Id == m.TenantId);
                        return t != null && t.IsActive && !t.IsDeleted;
                    })
                    .ToList();

                if (!isSuperAdmin && activeMemberships.Count == 0)
                {
                    var inactiveTenant = allTenants.FirstOrDefault(t => userMemberships.Any(m => m.TenantId == t.Id));
                    var inactiveTenantName = inactiveTenant?.Name ?? "your assigned Regional Office";
                    return ApiResponse<VerifyStaffSessionDto>.Fail(
                        $"Access Denied: Your assigned Regional Office '{inactiveTenantName}' is currently inactive. Please contact your system administrator."
                    );
                }

                // If non-SuperAdmin staff only belongs to a single active tenant and requested AUTO (or matching region), auto-select it
                if (!isSuperAdmin && activeMemberships.Count == 1 && isAutoSelectRequest)
                {
                    matchingMembership = activeMemberships[0];
                }
                else
                {
                    // Find active membership matching the selected region or tenant code/name
                    matchingMembership = activeMemberships.FirstOrDefault(m =>
                    {
                        var t = allTenants.FirstOrDefault(tenant => tenant.Id == m.TenantId);
                        if (t == null) return false;
                        if (targetRegion != null && t.RegionId != Guid.Empty && t.RegionId == targetRegion.Id) return true;
                        return string.Equals(t.Code, selectedRegionInput, StringComparison.OrdinalIgnoreCase) ||
                               string.Equals(t.Name, selectedRegionInput, StringComparison.OrdinalIgnoreCase);
                    });

                    // Check if they explicitly selected an assigned membership whose tenant is inactive
                    if (matchingMembership == null)
                    {
                        var inactiveMatchingMembership = userMemberships.FirstOrDefault(m =>
                        {
                            var t = allTenants.FirstOrDefault(tenant => tenant.Id == m.TenantId);
                            if (t == null || (t.IsActive && !t.IsDeleted)) return false;
                            if (targetRegion != null && t.RegionId != Guid.Empty && t.RegionId == targetRegion.Id) return true;
                            return string.Equals(t.Code, selectedRegionInput, StringComparison.OrdinalIgnoreCase) ||
                                   string.Equals(t.Name, selectedRegionInput, StringComparison.OrdinalIgnoreCase);
                        });

                        if (inactiveMatchingMembership != null && !isSuperAdmin)
                        {
                            var inactiveT = allTenants.FirstOrDefault(t => t.Id == inactiveMatchingMembership.TenantId);
                            return ApiResponse<VerifyStaffSessionDto>.Fail(
                                $"Access Denied: Your assigned Regional Office '{inactiveT?.Name ?? request.SelectedRegion}' is currently inactive. Please contact your system administrator."
                            );
                        }
                    }
                }

                if (matchingMembership == null && !isSuperAdmin)
                {
                    // User has assigned active region(s) but selected an unassigned region
                    var firstAssignedTenant = allTenants.FirstOrDefault(t => t.Id == activeMemberships[0].TenantId);
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
                    resolvedTenant = allTenants.FirstOrDefault(t => t.Id == matchingMembership.TenantId && t.IsActive && !t.IsDeleted);
                    if (resolvedTenant != null && resolvedTenant.RegionId != Guid.Empty)
                    {
                        var resolvedRegion = allRegions.FirstOrDefault(r => r.Id == resolvedTenant.RegionId);
                        if (resolvedRegion != null)
                        {
                            targetRegion = resolvedRegion;
                            regionCode = resolvedRegion.Code;
                            regionName = resolvedRegion.Name;
                        }
                    }
                }
            }
        }

        if (resolvedTenant == null && targetRegion != null)
        {
            resolvedTenant = allTenants.FirstOrDefault(t => t.RegionId == targetRegion.Id && t.IsActive && !t.IsDeleted);
            if (resolvedTenant == null)
            {
                var inactiveRegionTenant = allTenants.FirstOrDefault(t => t.RegionId == targetRegion.Id && (!t.IsActive || t.IsDeleted));
                if (inactiveRegionTenant != null)
                {
                    return ApiResponse<VerifyStaffSessionDto>.Fail(
                        $"Access Denied: The selected Regional Office '{inactiveRegionTenant.Name}' is currently inactive."
                    );
                }
            }
        }

        if (resolvedTenant == null)
        {
            var defaultTenantId = SeedConstants.DefaultTenantId;
            resolvedTenant = allTenants.FirstOrDefault(t => t.Id == defaultTenantId && t.IsActive && !t.IsDeleted)
                          ?? allTenants.FirstOrDefault(t => t.IsActive && !t.IsDeleted);
        }

        if (resolvedTenant != null && (!resolvedTenant.IsActive || resolvedTenant.IsDeleted))
        {
            return ApiResponse<VerifyStaffSessionDto>.Fail(
                $"Access Denied: The selected Regional Office '{resolvedTenant.Name}' is currently inactive."
            );
        }

        var finalTenantId = resolvedTenant?.Id ?? SeedConstants.DefaultTenantId;
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
                if (!effectivePermissions.Contains(Permissions.ReadTenants))
                {
                    effectivePermissions.Add(Permissions.ReadTenants);
                }

                var receiptActionPermissions = new[]
                {
                    Permissions.ReceiptsBundleEntry,
                    Permissions.ReceiptsIssue,
                    Permissions.ReceiptsEdit,
                    Permissions.ReceiptsCancel,
                    Permissions.ReceiptsDeposit,
                    Permissions.BankAccountsManage,
                    Permissions.CashierReports,
                    Permissions.CollectPayment,
                    Permissions.ReturnOp
                };

                if (string.Equals(resolvedRole.Key, "cashier", StringComparison.OrdinalIgnoreCase) ||
                    string.Equals(resolvedRole.Name, "Cashier", StringComparison.OrdinalIgnoreCase))
                {
                    effectivePermissions.Add(Permissions.ReceiptsRead);
                    effectivePermissions.AddRange(receiptActionPermissions);
                }
                else if (receiptActionPermissions.Any(p => effectivePermissions.Contains(p)))
                {
                    effectivePermissions.Add(Permissions.ReceiptsRead);
                }
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

        if (user != null && (user.IsSuperAdmin || AdministrativeIdentityPolicy.IsAdministrativeEmail(user.Email)))
        {
            if (!assignedRoleNames.Contains("Super Administrator") && !assignedRoleNames.Contains("SuperAdmin") && !assignedRoleNames.Contains("Administrator"))
            {
                assignedRoleNames.Insert(0, user.IsSuperAdmin ? "Super Administrator" : "Administrator");
            }
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
