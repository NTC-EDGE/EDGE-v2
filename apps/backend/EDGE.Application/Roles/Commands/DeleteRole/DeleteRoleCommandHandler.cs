using MediatR;
using EDGE.Domain.Authorization;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.Roles.Commands;

public class DeleteRoleCommandHandler : IRequestHandler<DeleteRoleCommand, bool>
{
    private readonly IRoleRepository _roleRepository;
    private readonly ITenantContextService _tenantContextService;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteRoleCommandHandler(
        IRoleRepository roleRepository,
        ITenantContextService tenantContextService,
        IUnitOfWork unitOfWork)
    {
        _roleRepository = roleRepository;
        _tenantContextService = tenantContextService;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(DeleteRoleCommand request, CancellationToken cancellationToken)
    {
        var role = await _roleRepository.GetByIdAsync(request.Id, cancellationToken);
        if (role == null) return false;

        // 1. Standard / System roles cannot be deleted
        if (role.TenantId == null || role.IsSystemRole)
        {
            throw new InvalidOperationException("Standard system roles cannot be deleted.");
        }

        // 2. Tenant admin can only delete custom roles belonging to their own tenant
        await _tenantContextService.EnsureUserActiveMemberAsync(
            role.TenantId.Value,
            "You are only authorized to delete roles belonging to your own regional tenant.",
            cancellationToken);

        _roleRepository.Delete(role);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return true;
    }
}
