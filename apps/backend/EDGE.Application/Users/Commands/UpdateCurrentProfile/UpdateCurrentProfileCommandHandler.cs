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
        var user = await _userRepository.ResolveCurrentUserAsync(_currentUserService, cancellationToken);
        if (user == null)
        {
            return null;
        }

        if (request.FirstName != null) user.FirstName = request.FirstName.Trim();
        if (request.LastName != null) user.LastName = request.LastName.Trim();
        if (request.MiddleName != null) user.MiddleName = request.MiddleName.Trim();
        if (request.Suffix != null) user.Suffix = request.Suffix.Trim();
        if (request.ContactNumber != null) user.ContactNumber = request.ContactNumber.Trim();
        if (request.DateOfBirth.HasValue) user.DateOfBirth = request.DateOfBirth.Value;
        if (request.Sex != null) user.Sex = request.Sex.Trim();
        if (request.Nationality != null) user.Nationality = request.Nationality.Trim();
        if (request.Height.HasValue) user.Height = request.Height.Value;
        if (request.Weight.HasValue) user.Weight = request.Weight.Value;
        if (request.SchoolAttended != null) user.SchoolAttended = request.SchoolAttended.Trim();
        if (request.CourseTaken != null) user.CourseTaken = request.CourseTaken.Trim();
        if (request.Street != null) user.Street = request.Street.Trim();
        if (request.Unit != null) user.Unit = request.Unit.Trim();
        if (request.ZipCode != null) user.ZipCode = request.ZipCode.Trim();
        if (request.BarangayId.HasValue && request.BarangayId.Value != Guid.Empty) user.BarangayId = request.BarangayId.Value;
        if (request.ESignature != null) user.ESignature = request.ESignature;

        bool hasCompanyFields =
            !string.IsNullOrWhiteSpace(request.CompanyName) ||
            !string.IsNullOrWhiteSpace(request.CompanyRegistrationNumber) ||
            !string.IsNullOrWhiteSpace(request.CompanyAddress) ||
            !string.IsNullOrWhiteSpace(request.CompanyContactNumber) ||
            !string.IsNullOrWhiteSpace(request.CompanyEmail);

        if (hasCompanyFields)
        {
            if (user.CompanyDetail == null)
            {
                user.CompanyDetail = new CompanyDetail
                {
                    Id = Guid.NewGuid(),
                    Name = request.CompanyName?.Trim() ?? string.Empty,
                    RegistrationNumber = request.CompanyRegistrationNumber?.Trim() ?? string.Empty,
                    Address = request.CompanyAddress?.Trim() ?? string.Empty,
                    ContactNumber = request.CompanyContactNumber?.Trim() ?? string.Empty,
                    Email = request.CompanyEmail?.Trim()
                };
                user.CompanyDetailId = user.CompanyDetail.Id;
            }
            else
            {
                if (request.CompanyName != null) user.CompanyDetail.Name = request.CompanyName.Trim();
                if (request.CompanyRegistrationNumber != null) user.CompanyDetail.RegistrationNumber = request.CompanyRegistrationNumber.Trim();
                if (request.CompanyAddress != null) user.CompanyDetail.Address = request.CompanyAddress.Trim();
                if (request.CompanyContactNumber != null) user.CompanyDetail.ContactNumber = request.CompanyContactNumber.Trim();
                if (request.CompanyEmail != null) user.CompanyDetail.Email = request.CompanyEmail.Trim();
            }
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return user;
    }
}
