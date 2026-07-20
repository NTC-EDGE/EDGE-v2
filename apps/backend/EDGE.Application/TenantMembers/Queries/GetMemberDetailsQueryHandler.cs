using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.TenantMembers.DTOs;

namespace EDGE.Application.TenantMembers.Queries;

public class GetMemberDetailsQueryHandler : IRequestHandler<GetMemberDetailsQuery, TenantMemberDto>
{
    private readonly ITenantMemberRepository _memberRepository;

    public GetMemberDetailsQueryHandler(ITenantMemberRepository memberRepository)
    {
        _memberRepository = memberRepository;
    }

    public async Task<TenantMemberDto> Handle(GetMemberDetailsQuery request, CancellationToken cancellationToken)
    {
        var member = await _memberRepository.GetByIdAsync(request.MemberId, cancellationToken);
        if (member == null || member.TenantId != request.TenantId)
        {
            throw new KeyNotFoundException($"Tenant member with ID '{request.MemberId}' was not found in Tenant '{request.TenantId}'.");
        }

        return new TenantMemberDto
        {
            Id = member.Id,
            TenantId = member.TenantId,
            TenantName = member.Tenant.Name,
            UserId = member.UserId,
            UserEmail = string.Empty, // Populate dynamically later when User entity is available
            UserFirstName = string.Empty,
            UserLastName = string.Empty,
            JobTitle = member.JobTitle,
            ContactNumber = member.ContactNumber,
            Department = member.Department,
            IsAdmin = member.IsAdmin,
            IsActive = member.IsActive,
            CreatedAt = member.CreatedAt,
            CreatedBy = member.CreatedBy,
            LastModifiedAt = member.LastModifiedAt,
            LastModifiedBy = member.LastModifiedBy
        };
    }
}
