using MediatR;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.TenantMembers.DTOs;

namespace EDGE.Application.TenantMembers.Commands;

public class UpdateMemberDetailsCommandHandler : IRequestHandler<UpdateMemberDetailsCommand, TenantMemberDto>
{
    private readonly ITenantMemberRepository _memberRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateMemberDetailsCommandHandler(ITenantMemberRepository memberRepository, IUnitOfWork unitOfWork)
    {
        _memberRepository = memberRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<TenantMemberDto> Handle(UpdateMemberDetailsCommand request, CancellationToken cancellationToken)
    {
        var member = await _memberRepository.GetByIdAsync(request.MemberId, cancellationToken);
        if (member == null || member.TenantId != request.TenantId)
        {
            throw new KeyNotFoundException($"Tenant member with ID '{request.MemberId}' was not found in Tenant '{request.TenantId}'.");
        }

        member.JobTitle = request.JobTitle;
        member.ContactNumber = request.ContactNumber;
        member.Department = request.Department;
        member.IsAdmin = request.IsAdmin;
        member.IsActive = request.IsActive;

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new TenantMemberDto
        {
            Id = member.Id,
            TenantId = member.TenantId,
            TenantName = member.Tenant.Name,
            UserId = member.UserId,
            UserEmail = member.User.Email,
            UserFirstName = member.User.FirstName,
            UserLastName = member.User.LastName,
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
