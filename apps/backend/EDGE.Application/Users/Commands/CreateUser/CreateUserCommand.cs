using MediatR;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.Users.Commands.CreateUser;

public record CreateUserCommand(
    string AuthUserId,
    string Email,
    string FirstName,
    string LastName
) : IRequest<Guid>;

public class CreateUserCommandHandler : IRequestHandler<CreateUserCommand, Guid>
{
    private readonly IUserRepository _userRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateUserCommandHandler(IUserRepository userRepository, IUnitOfWork unitOfWork)
    {
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Guid> Handle(CreateUserCommand request, CancellationToken cancellationToken)
    {
        var existing = await _userRepository.GetByAuthUserIdAsync(request.AuthUserId, cancellationToken);
        if (existing != null)
        {
            return existing.Id;
        }

        var user = new User
        {
            AuthUserId = request.AuthUserId,
            Email = request.Email,
            FirstName = request.FirstName,
            LastName = request.LastName
        };

        await _userRepository.AddAsync(user, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return user.Id;
    }
}
