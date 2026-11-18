using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Domain.Authorization;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.TenantMembers.DTOs;

namespace EDGE.Application.TenantMembers.Commands;

public class AssignUserToTenantCommandHandler : IRequestHandler<AssignUserToTenantCommand, TenantMemberDto>
{
    private readonly ITenantRepository _tenantRepository;
    private readonly ITenantMemberRepository _memberRepository;
    private readonly IRoleRepository _roleRepository;
    private readonly IFieldOfficeRepository? _fieldOfficeRepository;
    private readonly ITenantContextService _tenantContextService;
    private readonly IUserRepository _userRepository;
    private readonly IUnitOfWork _unitOfWork;

    public AssignUserToTenantCommandHandler(
        ITenantRepository tenantRepository,
        ITenantMemberRepository memberRepository,
        IRoleRepository roleRepository,
        ITenantContextService tenantContextService,
        IUserRepository userRepository,
        IUnitOfWork unitOfWork,
        IFieldOfficeRepository? fieldOfficeRepository = null)
    {
        _tenantRepository = tenantRepository;
        _memberRepository = memberRepository;
        _roleRepository = roleRepository;
        _tenantContextService = tenantContextService;
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
        _fieldOfficeRepository = fieldOfficeRepository;
    }

    public async Task<TenantMemberDto> Handle(AssignUserToTenantCommand request, CancellationToken cancellationToken)
    {
        // 1. Verify Tenant exists
        var tenant = await _tenantRepository.GetByIdAsync(request.TenantId, cancellationToken);
        if (tenant == null)
        {
            throw new KeyNotFoundException($"Tenant with ID '{request.TenantId}' was not found.");
        }

        // 2. Verify Caller Tenant Authorization (SuperAdmins can assign to any tenant; Tenant Admins can only assign to their own tenant)
        await _tenantContextService.EnsureUserActiveMemberAsync(
            request.TenantId,
            "You are only authorized to assign members to your own regional tenant.",
            cancellationToken);

        // 3. Verify Role belongs to target tenant or is a standard role
        var role = await _roleRepository.GetByIdAsync(request.RoleId, cancellationToken);
        if (role == null || (role.TenantId != null && role.TenantId != request.TenantId))
        {
            throw new InvalidOperationException($"Role '{request.RoleId}' is not valid for tenant '{request.TenantId}'.");
        }

        // 3b. Resolve FieldOfficeId (validate against Tenant or default to Tenant's Main Office)
        Guid? resolvedFieldOfficeId = request.FieldOfficeId;
        FieldOffice? mainFieldOffice = null;
        if (_fieldOfficeRepository != null)
        {
            var tenantOffices = await _fieldOfficeRepository.GetByTenantIdAsync(request.TenantId, cancellationToken);
            mainFieldOffice = tenantOffices.FirstOrDefault(f => f.Category == FieldOfficeCategory.Main)
                              ?? tenantOffices.FirstOrDefault();

            if (resolvedFieldOfficeId.HasValue && resolvedFieldOfficeId.Value != Guid.Empty)
            {
                var selectedOffice = tenantOffices.FirstOrDefault(f => f.Id == resolvedFieldOfficeId.Value)
                                     ?? await _fieldOfficeRepository.GetByIdAsync(resolvedFieldOfficeId.Value, cancellationToken);
                if (selectedOffice == null || selectedOffice.TenantId != request.TenantId)
                {
                    throw new InvalidOperationException("The selected field office does not belong to the specified regional tenant.");
                }
                resolvedFieldOfficeId = selectedOffice.Id;
            }
            else if (mainFieldOffice != null)
            {
                resolvedFieldOfficeId = mainFieldOffice.Id;
            }
        }

        // 4. Verify duplication or restore soft-deleted assignment
        var existingAssignment = await _memberRepository.GetByTenantAndUserAsync(request.TenantId, request.UserId, cancellationToken);
        if (existingAssignment != null)
        {
            if (!existingAssignment.IsDeleted)
            {
                throw new InvalidOperationException($"User '{request.UserId}' is already assigned to Tenant '{request.TenantId}'.");
            }

            // Restore and reactivate previously removed tenant member
            existingAssignment.IsDeleted = false;
            existingAssignment.IsDeletedBy = string.Empty;
            existingAssignment.RoleId = request.RoleId;
            existingAssignment.FieldOfficeId = resolvedFieldOfficeId;
            existingAssignment.JobTitle = request.JobTitle;
            existingAssignment.Level = request.Level;
            existingAssignment.Division = request.Division;
            existingAssignment.Position = request.Position;
            existingAssignment.Designation = request.Designation;
            existingAssignment.LastModifiedAt = DateTime.UtcNow;

            await _unitOfWork.SaveChangesAsync(cancellationToken);

            var reactivatedMember = await _memberRepository.GetByIdAsync(existingAssignment.Id, cancellationToken);
            var user = await _userRepository.GetByIdAsync(existingAssignment.UserId, cancellationToken);

            return new TenantMemberDto
            {
                Id = reactivatedMember?.Id ?? existingAssignment.Id,
                TenantId = reactivatedMember?.TenantId ?? existingAssignment.TenantId,
                TenantName = reactivatedMember?.Tenant?.Name ?? string.Empty,
                UserId = existingAssignment.UserId,
                UserEmail = user?.Email ?? string.Empty,
                UserFirstName = user?.FirstName ?? string.Empty,
                UserLastName = user?.LastName ?? string.Empty,
                RoleId = existingAssignment.RoleId,
                FieldOfficeId = existingAssignment.FieldOfficeId,
                FieldOfficeName = reactivatedMember?.FieldOffice?.Name,
                JobTitle = existingAssignment.JobTitle,
                Level = existingAssignment.Level,
                Division = existingAssignment.Division,
                Position = existingAssignment.Position,
                Designation = existingAssignment.Designation,
                IsDeleted = false,
                CreatedAt = existingAssignment.CreatedAt,
                CreatedBy = existingAssignment.CreatedBy,
                LastModifiedAt = existingAssignment.LastModifiedAt,
                LastModifiedBy = existingAssignment.LastModifiedBy
            };
        }

        var member = new TenantMember
        {
            TenantId = request.TenantId,
            UserId = request.UserId,
            RoleId = request.RoleId,
            FieldOfficeId = resolvedFieldOfficeId,
            JobTitle = request.JobTitle,
            Level = request.Level,
            Division = request.Division,
            Position = request.Position,
            Designation = request.Designation
        };

        await _memberRepository.AddAsync(member, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // If the tenant had no Main Office yet, auto-create it now
        if (_fieldOfficeRepository != null && mainFieldOffice == null)
        {
            var cleanTenantName = tenant.Name.Trim();
            var mainOfficeName = cleanTenantName.EndsWith("Main Office", StringComparison.OrdinalIgnoreCase)
                ? cleanTenantName
                : $"{cleanTenantName} - Main Office";
            var mainOfficeCode = $"{(string.IsNullOrWhiteSpace(tenant.Code) ? "NTC" : tenant.Code.Trim().ToUpperInvariant())}-MAIN";

            mainFieldOffice = new FieldOffice
            {
                Id = Guid.NewGuid(),
                TenantId = request.TenantId,
                Name = mainOfficeName,
                Code = mainOfficeCode,
                Category = FieldOfficeCategory.Main,
                Description = !string.IsNullOrWhiteSpace(tenant.Description)
                    ? tenant.Description
                    : $"Regional Main Office for {cleanTenantName}",
                RegionId = tenant.RegionId,
                Address = cleanTenantName,
                ContactPhone = string.Empty,
                ContactEmail = string.Empty,
                OfficerInChargeId = member.Id,
                IsActive = true,
                AllowSpectrumInspection = true,
                AllowPermitIssuance = true,
                AllowComplaintReception = true
            };

            await _fieldOfficeRepository.AddAsync(mainFieldOffice, cancellationToken);
            if (!member.FieldOfficeId.HasValue || member.FieldOfficeId.Value == Guid.Empty)
            {
                member.FieldOfficeId = mainFieldOffice.Id;
            }
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }

        // Fetch back with navigation properties populated
        var savedMember = await _memberRepository.GetByIdAsync(member.Id, cancellationToken);
        if (savedMember == null)
        {
            throw new InvalidOperationException("Failed to retrieve the newly created tenant member.");
        }

        var assignedUser = await _userRepository.GetByIdAsync(savedMember.UserId, cancellationToken);

        return new TenantMemberDto
        {
            Id = savedMember.Id,
            TenantId = savedMember.TenantId,
            TenantName = savedMember.Tenant?.Name ?? string.Empty,
            UserId = savedMember.UserId,
            UserEmail = assignedUser?.Email ?? string.Empty,
            UserFirstName = assignedUser?.FirstName ?? string.Empty,
            UserLastName = assignedUser?.LastName ?? string.Empty,
            RoleId = savedMember.RoleId,
            FieldOfficeId = savedMember.FieldOfficeId,
            FieldOfficeName = savedMember.FieldOffice?.Name,
            JobTitle = savedMember.JobTitle,
            Level = savedMember.Level,
            Division = savedMember.Division,
            Position = savedMember.Position,
            Designation = savedMember.Designation,
            IsDeleted = savedMember.IsDeleted,
            CreatedAt = savedMember.CreatedAt,
            CreatedBy = savedMember.CreatedBy,
            LastModifiedAt = savedMember.LastModifiedAt,
            LastModifiedBy = savedMember.LastModifiedBy
        };
    }
}
