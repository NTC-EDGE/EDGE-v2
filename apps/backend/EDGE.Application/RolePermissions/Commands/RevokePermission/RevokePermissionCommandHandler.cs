using MediatR;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.RolePermissions.Commands;

public class RevokePermissionCommandHandler : IRequestHandler<RevokePermissionCommand, bool>
{
    private readonly IRolePermissionRepository _rolePermissionRepository;
    private readonly IUnitOfWork _unitOfWork;

    public RevokePermissionCommandHandler(
        IRolePermissionRepository rolePermissionRepository,
        IUnitOfWork unitOfWork)
    {
        _rolePermissionRepository = rolePermissionRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(RevokePermissionCommand request, CancellationToken cancellationToken)
    {
        var existing = await _rolePermissionRepository.GetAsync(request.RoleId, request.PermissionId, cancellationToken);
        if (existing == null) return false;

        _rolePermissionRepository.Delete(existing);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return true;
    }
}
