using MediatR;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.TenantMembers.DTOs;

namespace EDGE.Application.TenantMembers.Commands;

public class AssignUserToTenantCommandHandler : IRequestHandler<AssignUserToTenantCommand, TenantMemberDto>
{
    private readonly ITenantRepository _tenantRepository;
    private readonly IUserRepository _userRepository;
    private readonly ITenantMemberRepository _memberRepository;
    private readonly IUnitOfWork _unitOfWork;

    public AssignUserToTenantCommandHandler(
        ITenantRepository tenantRepository,
        IUserRepository userRepository,
        ITenantMemberRepository memberRepository,
        IUnitOfWork unitOfWork)
    {
        _tenantRepository = tenantRepository;
        _userRepository = userRepository;
        _memberRepository = memberRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<TenantMemberDto> Handle(AssignUserToTenantCommand request, CancellationToken cancellationToken)
    {
        // 1. Verify Tenant exists
        var tenant = await _tenantRepository.GetByIdAsync(request.TenantId, cancellationToken);
        if (tenant == null)
        {
            throw new KeyNotFoundException($"Tenant with ID '{request.TenantId}' was not found.");
        }

        // 2. Verify User exists
        var user = await _userRepository.GetByIdAsync(request.UserId, cancellationToken);
        if (user == null)
        {
            throw new KeyNotFoundException($"User with ID '{request.UserId}' was not found.");
        }

        // 3. Verify duplication
        var existingAssignment = await _memberRepository.GetByTenantAndUserAsync(request.TenantId, request.UserId, cancellationToken);
        if (existingAssignment != null)
        {
            throw new InvalidOperationException($"User '{request.UserId}' is already assigned to Tenant '{request.TenantId}'.");
        }

        var member = new TenantMember
        {
            TenantId = request.TenantId,
            UserId = request.UserId,
            JobTitle = request.JobTitle,
            ContactNumber = request.ContactNumber,
            Department = request.Department,
            IsAdmin = request.IsAdmin,
            IsActive = true
        };

        await _memberRepository.AddAsync(member, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Fetch back with navigation properties populated
        var savedMember = await _memberRepository.GetByIdAsync(member.Id, cancellationToken);
        if (savedMember == null)
        {
            throw new InvalidOperationException("Failed to retrieve the newly created tenant member.");
        }

        return new TenantMemberDto
        {
            Id = savedMember.Id,
            TenantId = savedMember.TenantId,
            TenantName = savedMember.Tenant.Name,
            UserId = savedMember.UserId,
            UserEmail = savedMember.User.Email,
            UserFirstName = savedMember.User.FirstName,
            UserLastName = savedMember.User.LastName,
            JobTitle = savedMember.JobTitle,
            ContactNumber = savedMember.ContactNumber,
            Department = savedMember.Department,
            IsAdmin = savedMember.IsAdmin,
            IsActive = savedMember.IsActive,
            CreatedAt = savedMember.CreatedAt,
            CreatedBy = savedMember.CreatedBy,
            LastModifiedAt = savedMember.LastModifiedAt,
            LastModifiedBy = savedMember.LastModifiedBy
        };
    }
}
