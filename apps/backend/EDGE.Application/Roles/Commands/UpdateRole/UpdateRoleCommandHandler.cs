using MediatR;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.Roles.Commands;

public class UpdateRoleCommandHandler : IRequestHandler<UpdateRoleCommand, Role?>
{
    private readonly IRoleRepository _roleRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateRoleCommandHandler(IRoleRepository roleRepository, IUnitOfWork unitOfWork)
    {
        _roleRepository = roleRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Role?> Handle(UpdateRoleCommand request, CancellationToken cancellationToken)
    {
        var role = await _roleRepository.GetByIdAsync(request.Id, cancellationToken);
        if (role == null) return null;

        role.Name = request.Name;
        role.Key = request.Key;

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return role;
    }
}
