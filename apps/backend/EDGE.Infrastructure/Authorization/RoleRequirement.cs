using Microsoft.AspNetCore.Authorization;

namespace EDGE.Infrastructure.Authorization;

public class RoleRequirement : IAuthorizationRequirement
{
    public string Role { get; }

    public RoleRequirement(string role)
    {
        Role = role ?? throw new ArgumentNullException(nameof(role));
    }
}
