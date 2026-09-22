using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Application.Users.DTOs;

namespace EDGE.Application.Users.Queries;

public class GetUsersQueryHandler : IRequestHandler<GetUsersQuery, PaginatedApiResponse<UserDto>>
{
    private readonly IUserRepository _userRepository;

    public GetUsersQueryHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<PaginatedApiResponse<UserDto>> Handle(GetUsersQuery request, CancellationToken cancellationToken)
    {
        var users = await _userRepository.GetAllAsync(cancellationToken);
        IEnumerable<EDGE.Domain.Entities.User> filtered = users;

        if (request.TenantId.HasValue && request.TenantId.Value != Guid.Empty)
        {
            filtered = filtered.Where(u => u.TenantMemberships != null && u.TenantMemberships.Any(tm => tm.TenantId == request.TenantId.Value));
        }

        if (request.RegionId.HasValue && request.RegionId.Value != Guid.Empty)
        {
            filtered = filtered.Where(u => u.TenantMemberships != null && u.TenantMemberships.Any(tm => tm.Tenant != null && tm.Tenant.RegionId == request.RegionId.Value));
        }

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var term = request.SearchTerm.Trim().ToLowerInvariant();
            filtered = filtered.Where(u =>
                (!string.IsNullOrEmpty(u.FirstName) && u.FirstName.ToLowerInvariant().Contains(term)) ||
                (!string.IsNullOrEmpty(u.LastName) && u.LastName.ToLowerInvariant().Contains(term)) ||
                (!string.IsNullOrEmpty(u.Email) && u.Email.ToLowerInvariant().Contains(term)) ||
                (!string.IsNullOrEmpty(u.ContactNumber) && u.ContactNumber.Contains(term))
            );
        }

        var totalCount = filtered.Count();
        var pageNumber = Math.Max(1, request.PageNumber);
        var pageSize = Math.Clamp(request.PageSize <= 0 ? 50 : request.PageSize, 1, 100);

        var paginatedUsers = filtered
            .OrderBy(u => u.FirstName)
            .ThenBy(u => u.LastName)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(u => new UserDto
            {
                Id = u.Id,
                AuthUserId = u.AuthUserId,
                Email = u.Email,
                FirstName = u.FirstName,
                LastName = u.LastName,
                MiddleName = u.MiddleName,
                Suffix = u.Suffix,
                ContactNumber = u.ContactNumber,
                ProfilePicture = u.ProfilePicture,
                ESignature = u.ESignature,
                IsSuperAdmin = u.IsSuperAdmin,
                IsOnline = u.IsOnline,
                LastOnline = u.LastOnline,
                CreatedAt = u.CreatedAt,
                TenantMemberships = u.TenantMemberships != null
                    ? u.TenantMemberships.Select(tm => new UserTenantMembershipDto
                    {
                        Id = tm.Id,
                        TenantId = tm.TenantId,
                        TenantName = tm.Tenant != null ? tm.Tenant.Name : null,
                        RegionId = tm.Tenant != null ? tm.Tenant.RegionId : null,
                        RegionName = tm.Tenant != null && tm.Tenant.Region != null ? tm.Tenant.Region.Name : null,
                        RoleId = tm.RoleId,
                        Role = tm.Role != null ? new UserRoleDto
                        {
                            Id = tm.Role.Id,
                            Key = tm.Role.Key,
                            Name = tm.Role.Name
                        } : null,
                        FieldOfficeId = tm.FieldOfficeId,
                        FieldOffice = tm.FieldOffice != null ? new UserFieldOfficeDto
                        {
                            Id = tm.FieldOffice.Id,
                            Name = tm.FieldOffice.Name,
                            Code = tm.FieldOffice.Code
                        } : null,
                        JobTitle = tm.JobTitle,
                        Level = tm.Level,
                        Division = tm.Division,
                        Position = tm.Position,
                        Designation = tm.Designation
                    }).ToList()
                    : new List<UserTenantMembershipDto>()
            })
            .ToList();

        return new PaginatedApiResponse<UserDto>(paginatedUsers, pageNumber, pageSize, totalCount);
    }
}
