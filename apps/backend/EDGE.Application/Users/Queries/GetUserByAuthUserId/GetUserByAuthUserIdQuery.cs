using MediatR;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.Users.Queries.GetUserByAuthUserId;

public record GetUserByAuthUserIdQuery(string AuthUserId) : IRequest<User?>;

public class GetUserByAuthUserIdQueryHandler : IRequestHandler<GetUserByAuthUserIdQuery, User?>
{
    private readonly IUserRepository _userRepository;

    public GetUserByAuthUserIdQueryHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<User?> Handle(GetUserByAuthUserIdQuery request, CancellationToken cancellationToken)
    {
        return await _userRepository.GetByAuthUserIdAsync(request.AuthUserId, cancellationToken);
    }
}
