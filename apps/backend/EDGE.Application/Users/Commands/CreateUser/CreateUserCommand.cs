using MediatR;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.Users.Commands.CreateUser;

public record CreateUserCommand(
    string AuthUserId,
    string Email,
    string FirstName,
    string LastName,
    string? RoleKey = null
) : IRequest<Guid>;

public class CreateUserCommandHandler : IRequestHandler<CreateUserCommand, Guid>
{
    private readonly IUserRepository _userRepository;
    private readonly IRoleRepository _roleRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateUserCommandHandler(IUserRepository userRepository, IRoleRepository roleRepository, IUnitOfWork unitOfWork)
    {
        _userRepository = userRepository;
        _roleRepository = roleRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Guid> Handle(CreateUserCommand request, CancellationToken cancellationToken)
    {
        var existing = await _userRepository.GetByAuthUserIdAsync(request.AuthUserId, cancellationToken);
        if (existing != null)
        {
            return existing.Id;
        }

        var targetRoleKey = request.RoleKey ?? "client";
        var role = await _roleRepository.GetByKeyAsync(targetRoleKey, cancellationToken);
        if (role == null)
        {
            role = await _roleRepository.GetByKeyAsync("client", cancellationToken);
        }

        if (role == null)
        {
            throw new InvalidOperationException($"Role '{targetRoleKey}' or default role 'client' not found in system database.");
        }

        var user = new User
        {
            AuthUserId = request.AuthUserId,
            Email = request.Email,
            FirstName = request.FirstName,
            LastName = request.LastName,
            RoleId = role.Id
        };

        await _userRepository.AddAsync(user, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return user.Id;
    }
}
