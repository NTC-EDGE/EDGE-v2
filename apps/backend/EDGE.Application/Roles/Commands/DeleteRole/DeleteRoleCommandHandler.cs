using MediatR;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.Roles.Commands;

public class DeleteRoleCommandHandler : IRequestHandler<DeleteRoleCommand, bool>
{
    private readonly IRoleRepository _roleRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteRoleCommandHandler(IRoleRepository roleRepository, IUnitOfWork unitOfWork)
    {
        _roleRepository = roleRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(DeleteRoleCommand request, CancellationToken cancellationToken)
    {
        var role = await _roleRepository.GetByIdAsync(request.Id, cancellationToken);
        if (role == null) return false;

        _roleRepository.Delete(role);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return true;
    }
}
