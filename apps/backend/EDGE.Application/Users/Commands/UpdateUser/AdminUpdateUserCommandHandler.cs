using MediatR;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.Users.Commands.UpdateUser;

public class AdminUpdateUserCommandHandler : IRequestHandler<AdminUpdateUserCommand, User?>
{
    private readonly IUserRepository _userRepository;
    private readonly IUnitOfWork _unitOfWork;

    public AdminUpdateUserCommandHandler(IUserRepository userRepository, IUnitOfWork unitOfWork)
    {
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<User?> Handle(AdminUpdateUserCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.Id, cancellationToken);
        if (user == null) return null;

        user.FirstName = request.FirstName;
        user.LastName = request.LastName;
        if (request.IsSuperAdmin.HasValue)
        {
            user.IsSuperAdmin = request.IsSuperAdmin.Value;
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return user;
    }
}
