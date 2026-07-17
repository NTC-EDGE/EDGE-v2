using MediatR;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.RolePermissions.Commands;

public class AssignPermissionCommandHandler : IRequestHandler<AssignPermissionCommand, bool>
{
    private readonly IRolePermissionRepository _rolePermissionRepository;
    private readonly IRoleRepository _roleRepository;
    private readonly IUnitOfWork _unitOfWork;

    public AssignPermissionCommandHandler(
        IRolePermissionRepository rolePermissionRepository,
        IRoleRepository roleRepository,
        IUnitOfWork unitOfWork)
    {
        _rolePermissionRepository = rolePermissionRepository;
        _roleRepository = roleRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(AssignPermissionCommand request, CancellationToken cancellationToken)
    {
        // Verify role exists
        var role = await _roleRepository.GetByIdAsync(request.RoleId, cancellationToken);
        if (role == null) return false;

        // Check if permission mapping already exists
        var existing = await _rolePermissionRepository.GetAsync(request.RoleId, request.PermissionId, cancellationToken);
        if (existing != null) return true; // Already assigned

        var rp = new RolePermission
        {
            RoleId = request.RoleId,
            PermissionId = request.PermissionId
        };

        await _rolePermissionRepository.AddAsync(rp, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return true;
    }
}
