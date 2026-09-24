using System.Security.Claims;
using Microsoft.AspNetCore.SignalR;
using EDGE.Application.Common.Interfaces;
using EDGE.Domain.Entities;

namespace EDGE.Infrastructure.Hubs;

/// <summary>
/// Base class for SignalR hubs requiring user identity resolution from claims or database lookup.
/// </summary>
/// <typeparam name="TClient">The strongly typed SignalR client interface.</typeparam>
public abstract class AuthenticatedHub<TClient> : Hub<TClient> where TClient : class
{
    protected readonly IUserRepository UserRepository;

    protected AuthenticatedHub(IUserRepository userRepository)
    {
        UserRepository = userRepository;
    }

    /// <summary>
    /// Resolves the internal user ID (<see cref="Guid"/>) from SignalR Hub Context claims,
    /// falling back to database lookups by Auth0/Clerk user ID or email.
    /// </summary>
    /// <returns>The resolved user Guid, or null if resolution fails.</returns>
    protected virtual async Task<Guid?> ResolveUserIdAsync()
    {
        var identifier = Context.UserIdentifier
                      ?? Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value
                      ?? Context.User?.FindFirst("sub")?.Value
                      ?? Context.User?.FindFirst("user_id")?.Value;

        if (!string.IsNullOrWhiteSpace(identifier) && Guid.TryParse(identifier, out var parsedGuid))
        {
            return parsedGuid;
        }

        if (!string.IsNullOrWhiteSpace(identifier))
        {
            var user = await UserRepository.GetByAuthUserIdAsync(identifier);
            if (user != null)
            {
                return user.Id;
            }
        }

        var email = Context.User?.FindFirst(ClaimTypes.Email)?.Value
                 ?? Context.User?.FindFirst("email")?.Value;

        if (!string.IsNullOrWhiteSpace(email))
        {
            var userByEmail = await UserRepository.GetByEmailAsync(email);
            if (userByEmail != null)
            {
                return userByEmail.Id;
            }
        }

        return null;
    }

    /// <summary>
    /// Resolves the full <see cref="User"/> entity for the current connection context.
    /// </summary>
    protected virtual async Task<User?> ResolveCurrentUserAsync()
    {
        var identifier = Context.UserIdentifier
                      ?? Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value
                      ?? Context.User?.FindFirst("sub")?.Value
                      ?? Context.User?.FindFirst("user_id")?.Value;

        if (!string.IsNullOrWhiteSpace(identifier))
        {
            if (Guid.TryParse(identifier, out var parsedGuid))
            {
                var userById = await UserRepository.GetByIdAsync(parsedGuid);
                if (userById != null)
                {
                    return userById;
                }
            }

            var userByAuthId = await UserRepository.GetByAuthUserIdAsync(identifier);
            if (userByAuthId != null)
            {
                return userByAuthId;
            }
        }

        var email = Context.User?.FindFirst(ClaimTypes.Email)?.Value
                 ?? Context.User?.FindFirst("email")?.Value;

        if (!string.IsNullOrWhiteSpace(email))
        {
            return await UserRepository.GetByEmailAsync(email);
        }

        return null;
    }
}
