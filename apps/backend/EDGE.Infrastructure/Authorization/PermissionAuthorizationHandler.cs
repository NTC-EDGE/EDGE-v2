using Microsoft.AspNetCore.Authorization;
using EDGE.Domain.Authorization;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Infrastructure.Authorization;

public class PermissionAuthorizationHandler : AuthorizationHandler<PermissionRequirement>
{
    private readonly IUserAuthorizationService _userAuthorizationService;

    public PermissionAuthorizationHandler(IUserAuthorizationService userAuthorizationService)
    {
        _userAuthorizationService = userAuthorizationService;
    }

    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        PermissionRequirement requirement)
    {
        var hasPermission = await _userAuthorizationService.HasPermissionAsync(requirement.Permission);

        if (hasPermission)
        {
            context.Succeed(requirement);
        }
    }
}
