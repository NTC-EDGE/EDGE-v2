using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.Users.Commands.UpdateCurrentProfile;

public class UpdateCurrentProfileCommandHandler : IRequestHandler<UpdateCurrentProfileCommand, User?>
{
    private readonly IUserRepository _userRepository;
    private readonly ICurrentUserService _currentUserService;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateCurrentProfileCommandHandler(
        IUserRepository userRepository,
        ICurrentUserService currentUserService,
        IUnitOfWork unitOfWork)
    {
        _userRepository = userRepository;
        _currentUserService = currentUserService;
        _unitOfWork = unitOfWork;
    }

    public async Task<User?> Handle(UpdateCurrentProfileCommand request, CancellationToken cancellationToken)
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

        if (request.FirstName != null) user.FirstName = request.FirstName;
        if (request.LastName != null) user.LastName = request.LastName;
        if (request.MiddleName != null) user.MiddleName = request.MiddleName;
        if (request.Suffix != null) user.Suffix = request.Suffix;
        if (request.ContactNumber != null) user.ContactNumber = request.ContactNumber;
        if (request.DateOfBirth.HasValue) user.DateOfBirth = request.DateOfBirth.Value;
        if (request.Sex != null) user.Sex = request.Sex;
        if (request.Nationality != null) user.Nationality = request.Nationality;
        if (request.Street != null) user.Street = request.Street;
        if (request.Unit != null) user.Unit = request.Unit;
        if (request.ZipCode != null) user.ZipCode = request.ZipCode;
        if (request.BarangayId.HasValue) user.BarangayId = request.BarangayId.Value;
        if (request.ESignature != null) user.ESignature = request.ESignature;

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return user;
    }
}
