using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.Users.Queries.GetGlobalSupportUsers;

public class GetGlobalSupportUsersQueryHandler : IRequestHandler<GetGlobalSupportUsersQuery, List<GlobalSupportUserDto>>
{
    private readonly IUserRepository _userRepository;

    public GetGlobalSupportUsersQueryHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<List<GlobalSupportUserDto>> Handle(GetGlobalSupportUsersQuery request, CancellationToken cancellationToken)
    {
        Guid? parsedTenantId = !string.IsNullOrWhiteSpace(request.TenantId) && Guid.TryParse(request.TenantId, out var tid) ? tid : null;
        Guid? parsedRegionId = !string.IsNullOrWhiteSpace(request.RegionId) && Guid.TryParse(request.RegionId, out var rid) ? rid : null;

        var (users, _) = await _userRepository.GetPaginatedUsersAsync(
            1,
            1000,
            request.Search,
            parsedTenantId,
            parsedRegionId,
            null,
            cancellationToken);

        return users.Select(u =>
        {
            var primaryMembership = u.TenantMemberships?.FirstOrDefault(tm => !parsedTenantId.HasValue || tm.TenantId == parsedTenantId.Value)
                                    ?? u.TenantMemberships?.FirstOrDefault();

            var assignedRoles = (u.TenantMemberships?
                .Select(tm => tm.Role?.Name ?? tm.Position)
                .OfType<string>()
                .Where(r => !string.IsNullOrWhiteSpace(r))
                .ToList() is { Count: > 0 } roles ? roles : (u.IsSuperAdmin ? new List<string> { "SUPER_ADMIN" } : new List<string> { "STANDARD_USER" }));

            return new GlobalSupportUserDto
            {
                Id = u.Id,
                AuthUserId = u.AuthUserId,
                Email = u.Email,
                FirstName = u.FirstName,
                LastName = u.LastName,
                PhoneNumber = u.ContactNumber,
                RegionId = primaryMembership?.TenantId.ToString() ?? string.Empty,
                RegionName = primaryMembership?.Tenant?.Name ?? string.Empty,
                TenantId = primaryMembership?.TenantId,
                TenantName = primaryMembership?.Tenant?.Name,
                FieldOfficeName = primaryMembership?.FieldOffice?.Name,
                Status = "active",
                IsSuperAdmin = u.IsSuperAdmin,
                IsLockedOut = false,
                MfaEnabled = false,
                MfaMethod = null,
                LastLoginAt = u.LastOnline ?? u.CreatedAt,
                LastOnline = u.LastOnline,
                FailedLoginAttempts = 0,
                AuthProvider = "Clerk",
                AssignedRoles = assignedRoles,
                CreatedAt = u.CreatedAt,
                OpenTicketsCount = 0,
                TotalTicketsCount = 0
            };
        }).ToList();
    }
}
