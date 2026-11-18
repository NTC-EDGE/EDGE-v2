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

public class UpdateMemberDetailsCommandHandler : IRequestHandler<UpdateMemberDetailsCommand, TenantMemberDto>
{
    private readonly ITenantMemberRepository _memberRepository;
    private readonly IRoleRepository _roleRepository;
    private readonly IFieldOfficeRepository? _fieldOfficeRepository;
    private readonly ITenantContextService _tenantContextService;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateMemberDetailsCommandHandler(
        ITenantMemberRepository memberRepository,
        IRoleRepository roleRepository,
        ITenantContextService tenantContextService,
        IUnitOfWork unitOfWork,
        IFieldOfficeRepository? fieldOfficeRepository = null)
    {
        _memberRepository = memberRepository;
        _roleRepository = roleRepository;
        _tenantContextService = tenantContextService;
        _unitOfWork = unitOfWork;
        _fieldOfficeRepository = fieldOfficeRepository;
    }

    public async Task<TenantMemberDto> Handle(UpdateMemberDetailsCommand request, CancellationToken cancellationToken)
    {
        await _tenantContextService.EnsureUserActiveMemberAsync(
            request.TenantId,
            "You are only authorized to update members in your own regional tenant.",
            cancellationToken);

        var member = await _memberRepository.GetByIdAsync(request.MemberId, cancellationToken);
        if (member == null || member.TenantId != request.TenantId)
        {
            throw new KeyNotFoundException($"Tenant member with ID '{request.MemberId}' was not found in Tenant '{request.TenantId}'.");
        }

        var role = await _roleRepository.GetByIdAsync(request.RoleId, cancellationToken);
        if (role == null || (role.TenantId != null && role.TenantId != request.TenantId))
        {
            throw new InvalidOperationException($"Role '{request.RoleId}' is not valid for tenant '{request.TenantId}'.");
        }

        string? resolvedFieldOfficeName = member.FieldOffice?.Name;
        if (_fieldOfficeRepository != null)
        {
            var tenantOffices = await _fieldOfficeRepository.GetByTenantIdAsync(request.TenantId, cancellationToken);
            if (request.FieldOfficeId.HasValue && request.FieldOfficeId.Value != Guid.Empty)
            {
                var selectedOffice = tenantOffices.FirstOrDefault(f => f.Id == request.FieldOfficeId.Value)
                                     ?? await _fieldOfficeRepository.GetByIdAsync(request.FieldOfficeId.Value, cancellationToken);
                if (selectedOffice == null || selectedOffice.TenantId != request.TenantId)
                {
                    throw new InvalidOperationException("The selected field office does not belong to the specified regional tenant.");
                }
                member.FieldOfficeId = selectedOffice.Id;
                resolvedFieldOfficeName = selectedOffice.Name;
            }
            else if (!member.FieldOfficeId.HasValue || member.FieldOfficeId.Value == Guid.Empty)
            {
                var mainOffice = tenantOffices.FirstOrDefault(f => f.Category == FieldOfficeCategory.Main)
                                 ?? tenantOffices.FirstOrDefault();
                if (mainOffice != null)
                {
                    member.FieldOfficeId = mainOffice.Id;
                    resolvedFieldOfficeName = mainOffice.Name;
                }
            }
        }
        else if (request.FieldOfficeId.HasValue && request.FieldOfficeId.Value != Guid.Empty)
        {
            member.FieldOfficeId = request.FieldOfficeId.Value;
        }

        member.RoleId = request.RoleId;
        member.JobTitle = request.JobTitle;
        member.Level = request.Level;
        member.Division = request.Division;
        member.Position = request.Position;
        member.Designation = request.Designation;

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new TenantMemberDto
        {
            Id = member.Id,
            TenantId = member.TenantId,
            TenantName = member.Tenant?.Name ?? string.Empty,
            UserId = member.UserId,
            UserEmail = member.User?.Email ?? string.Empty,
            UserFirstName = member.User?.FirstName ?? string.Empty,
            UserLastName = member.User?.LastName ?? string.Empty,
            RoleId = member.RoleId,
            FieldOfficeId = member.FieldOfficeId,
            FieldOfficeName = resolvedFieldOfficeName,
            JobTitle = member.JobTitle,
            Level = member.Level,
            Division = member.Division,
            Position = member.Position,
            Designation = member.Designation,
            IsDeleted = member.IsDeleted,
            CreatedAt = member.CreatedAt,
            CreatedBy = member.CreatedBy,
            LastModifiedAt = member.LastModifiedAt,
            LastModifiedBy = member.LastModifiedBy
        };
    }
}
