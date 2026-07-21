using Microsoft.AspNetCore.Authorization;
using EDGE.Domain.Authorization;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Infrastructure.Authorization;

public class RoleAuthorizationHandler : AuthorizationHandler<RoleRequirement>
{
    private readonly IUserAuthorizationService _userAuthorizationService;

    public RoleAuthorizationHandler(IUserAuthorizationService userAuthorizationService)
    {
        _userAuthorizationService = userAuthorizationService;
    }

    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        RoleRequirement requirement)
    {
        var hasRole = await _userAuthorizationService.HasRoleAsync(requirement.Role);

        if (hasRole)
        {
            context.Succeed(requirement);
        }
    }
}
