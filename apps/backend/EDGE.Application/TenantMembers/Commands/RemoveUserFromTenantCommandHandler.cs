using MediatR;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.TenantMembers.Commands;

public class RemoveUserFromTenantCommandHandler : IRequestHandler<RemoveUserFromTenantCommand, bool>
{
    private readonly ITenantMemberRepository _memberRepository;
    private readonly IUnitOfWork _unitOfWork;

    public RemoveUserFromTenantCommandHandler(ITenantMemberRepository memberRepository, IUnitOfWork unitOfWork)
    {
        _memberRepository = memberRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(RemoveUserFromTenantCommand request, CancellationToken cancellationToken)
    {
        var member = await _memberRepository.GetByIdAsync(request.MemberId, cancellationToken);
        if (member == null || member.TenantId != request.TenantId)
        {
            throw new KeyNotFoundException($"Tenant member with ID '{request.MemberId}' was not found in Tenant '{request.TenantId}'.");
        }

        _memberRepository.Delete(member);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return true;
    }
}
