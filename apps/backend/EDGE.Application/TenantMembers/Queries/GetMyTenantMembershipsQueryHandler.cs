using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Application.TenantMembers.DTOs;
using EDGE.Domain.Authorization;
using EDGE.Domain.Entities;

namespace EDGE.Application.TenantMembers.Queries;

public class GetMyTenantMembershipsQueryHandler : IRequestHandler<GetMyTenantMembershipsQuery, ApiResponse<List<TenantRegionMembershipDto>>>
{
    private readonly ICurrentUserService _currentUserService;
    private readonly IUserRepository _userRepository;
    private readonly ITenantRepository _tenantRepository;
    private readonly ITenantMemberRepository _tenantMemberRepository;
    private readonly IGeographicRepository _geographicRepository;

    public GetMyTenantMembershipsQueryHandler(
        ICurrentUserService currentUserService,
        IUserRepository userRepository,
        ITenantRepository tenantRepository,
        ITenantMemberRepository tenantMemberRepository,
        IGeographicRepository geographicRepository)
    {
        _currentUserService = currentUserService;
        _userRepository = userRepository;
        _tenantRepository = tenantRepository;
        _tenantMemberRepository = tenantMemberRepository;
        _geographicRepository = geographicRepository;
    }

    public async Task<ApiResponse<List<TenantRegionMembershipDto>>> Handle(
        GetMyTenantMembershipsQuery request,
        CancellationToken cancellationToken)
    {
        var rawUserId = _currentUserService.UserId;
        var allRegions = await _geographicRepository.GetRegionsAsync(activeOnly: true, cancellationToken) ?? new List<Region>();
        var allTenants = await _tenantRepository.GetAllAsync(cancellationToken) ?? new List<Tenant>();

        var list = new List<TenantRegionMembershipDto>();

        User? user = null;
        if (!string.IsNullOrEmpty(rawUserId))
        {
            user = await _userRepository.ResolveCurrentUserAsync(_currentUserService, cancellationToken);
            if (user == null)
            {
                user = await _userRepository.GetByAuthUserIdAsync(rawUserId, cancellationToken);
            }
            if (user == null && Guid.TryParse(rawUserId, out var parsedUserId))
            {
                user = await _userRepository.GetByIdAsync(parsedUserId, cancellationToken);
            }
        }

        var isSuperAdmin = _currentUserService.IsSuperAdminClaim ||
                           AdministrativeIdentityPolicy.IsSuperAdminEmail(_currentUserService.Email) ||
                           (user != null && (user.IsSuperAdmin || AdministrativeIdentityPolicy.IsSuperAdminEmail(user.Email)));

        if (isSuperAdmin)
        {
            // SuperAdmins are granted access across all active Regional Offices / Tenants
            var candidateTenants = allTenants.Where(t => t.IsActive).ToList();
            if (candidateTenants.Count == 0 && allTenants.Count > 0)
            {
                candidateTenants = allTenants.ToList();
            }

            foreach (var tenant in candidateTenants)
            {
                var region = allRegions.FirstOrDefault(r => r.Id == tenant.RegionId);
                var regionCode = region?.Code ?? (!string.IsNullOrWhiteSpace(tenant.Code) ? tenant.Code : "NCR");
                var regionName = region?.Name ?? tenant.Name;

                list.Add(new TenantRegionMembershipDto(
                    TenantId: tenant.Id,
                    TenantName: tenant.Name,
                    RegionId: region?.Id ?? Guid.Empty,
                    RegionCode: regionCode,
                    RegionName: regionName
                ));
            }

            list = list
                .OrderBy(m => m.RegionCode.Equals("NCR", StringComparison.OrdinalIgnoreCase) ? 0 : 1)
                .ThenBy(m => m.RegionCode)
                .ToList();

            return ApiResponse<List<TenantRegionMembershipDto>>.Success(list, "SuperAdmin access: all regional offices retrieved successfully.");
        }

        if (user != null)
        {
            var userMemberships = await _tenantMemberRepository.GetMembersByUserAsync(user.Id, cancellationToken) ?? new List<TenantMember>();
            foreach (var mem in userMemberships)
            {
                var tenant = allTenants.FirstOrDefault(t => t.Id == mem.TenantId);
                if (tenant != null && tenant.IsActive)
                {
                    var region = allRegions.FirstOrDefault(r => r.Id == tenant.RegionId);
                    list.Add(new TenantRegionMembershipDto(
                        TenantId: tenant.Id,
                        TenantName: tenant.Name,
                        RegionId: region?.Id ?? Guid.Empty,
                        RegionCode: region?.Code ?? "NCR",
                        RegionName: region?.Name ?? "National Capital Region"
                    ));
                }
            }
        }

        // If no explicit tenant memberships exist and user is not authenticated or mock development fallback
        if (list.Count == 0 && string.IsNullOrEmpty(rawUserId))
        {
            var defaultNcr = allRegions.FirstOrDefault(r => string.Equals(r.Code, "NCR", StringComparison.OrdinalIgnoreCase));
            var defaultTenant = allTenants.FirstOrDefault();

            list.Add(new TenantRegionMembershipDto(
                TenantId: defaultTenant?.Id ?? Guid.NewGuid(),
                TenantName: defaultTenant?.Name ?? "NTC Regional Office - NCR",
                RegionId: defaultNcr?.Id ?? Guid.NewGuid(),
                RegionCode: defaultNcr?.Code ?? "NCR",
                RegionName: defaultNcr?.Name ?? "National Capital Region"
            ));
        }

        return ApiResponse<List<TenantRegionMembershipDto>>.Success(list, "User regional memberships retrieved successfully.");
    }
}
