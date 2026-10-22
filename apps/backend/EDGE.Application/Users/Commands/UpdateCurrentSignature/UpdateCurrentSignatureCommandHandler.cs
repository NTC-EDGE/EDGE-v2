using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.Users.Commands.UpdateCurrentSignature;

public class UpdateCurrentSignatureCommandHandler : IRequestHandler<UpdateCurrentSignatureCommand, User?>
{
    private readonly IUserRepository _userRepository;
    private readonly ICurrentUserService _currentUserService;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateCurrentSignatureCommandHandler(
        IUserRepository userRepository,
        ICurrentUserService currentUserService,
        IUnitOfWork unitOfWork)
    {
        _userRepository = userRepository;
        _currentUserService = currentUserService;
        _unitOfWork = unitOfWork;
    }

    public async Task<User?> Handle(UpdateCurrentSignatureCommand request, CancellationToken cancellationToken)
    {
        var authUserId = _currentUserService.UserId;
        if (string.IsNullOrEmpty(authUserId))
        {
            return null;
        }

        var user = await _userRepository.GetByAuthUserIdAsync(authUserId, cancellationToken);
        if (user == null)
        {
            return null;
        }

        user.ESignature = request.ESignature;
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return user;
    }
}
