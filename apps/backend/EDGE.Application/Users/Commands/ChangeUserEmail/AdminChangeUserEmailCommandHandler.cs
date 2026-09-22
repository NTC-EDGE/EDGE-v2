using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.Extensions.Logging;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.Users.Commands.ChangeUserEmail;

public class AdminChangeUserEmailCommandHandler : IRequestHandler<AdminChangeUserEmailCommand, User?>
{
    private readonly IUserRepository _userRepository;
    private readonly IClerkUserService _clerkUserService;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<AdminChangeUserEmailCommandHandler> _logger;

    public AdminChangeUserEmailCommandHandler(
        IUserRepository userRepository,
        IClerkUserService clerkUserService,
        IUnitOfWork unitOfWork,
        ILogger<AdminChangeUserEmailCommandHandler> logger)
    {
        _userRepository = userRepository;
        _clerkUserService = clerkUserService;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<User?> Handle(AdminChangeUserEmailCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.Id, cancellationToken);
        if (user == null)
        {
            return null;
        }

        var normalizedNewEmail = request.NewEmail.Trim().ToLowerInvariant();
        if (string.Equals(user.Email, normalizedNewEmail, StringComparison.OrdinalIgnoreCase))
        {
            return user;
        }

        // 1. Verify uniqueness across local database
        var existingDbUser = await _userRepository.GetByEmailAsync(normalizedNewEmail, cancellationToken);
        if (existingDbUser != null && existingDbUser.Id != user.Id)
        {
            _logger.LogWarning("Admin change user email rejected: Email '{Email}' already exists for another local user.", normalizedNewEmail);
            throw new InvalidOperationException($"An account with the email address '{normalizedNewEmail}' already exists.");
        }

        // 2. Verify uniqueness in Clerk
        var existingClerkUsers = await _clerkUserService.GetUsersByEmailAsync(normalizedNewEmail);
        if (existingClerkUsers.Any(u => !string.Equals(u.Id, user.AuthUserId, StringComparison.OrdinalIgnoreCase)))
        {
            _logger.LogWarning("Admin change user email rejected: Email '{Email}' already exists for another Clerk user.", normalizedNewEmail);
            throw new InvalidOperationException($"An account with the email address '{normalizedNewEmail}' already exists in Clerk.");
        }

        // 3. Synchronize primary email change to Clerk if user has an external AuthUserId
        if (!string.IsNullOrWhiteSpace(user.AuthUserId) && user.AuthUserId.StartsWith("user_"))
        {
            try
            {
                await _clerkUserService.UpdateUserPrimaryEmailAsync(user.AuthUserId, normalizedNewEmail);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to update primary email in Clerk for user {UserId} ({AuthUserId}) to {Email}", user.Id, user.AuthUserId, normalizedNewEmail);
                throw new InvalidOperationException($"Failed to update login email in identity provider: {ex.Message}");
            }
        }

        // 4. Update local user email
        user.Email = normalizedNewEmail;
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Successfully changed email to {Email} for user {UserId}", normalizedNewEmail, user.Id);
        return user;
    }
}
