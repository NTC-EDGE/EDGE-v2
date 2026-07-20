using MediatR;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.Users.Commands.UpdateUser;

public record UpdateUserCommand(
    string AuthUserId,
    string Email,
    string FirstName,
    string LastName
) : IRequest<bool>;

public class UpdateUserCommandHandler : IRequestHandler<UpdateUserCommand, bool>
{
    private readonly IUserRepository _userRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateUserCommandHandler(IUserRepository userRepository, IUnitOfWork unitOfWork)
    {
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(UpdateUserCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByAuthUserIdAsync(request.AuthUserId, cancellationToken);
        if (user == null)
        {
            return false;
        }

        user.Email = request.Email;
        user.FirstName = request.FirstName;
        user.LastName = request.LastName;

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }
}
