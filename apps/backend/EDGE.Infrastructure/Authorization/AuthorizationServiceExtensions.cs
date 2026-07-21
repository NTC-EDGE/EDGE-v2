using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.DependencyInjection;
using EDGE.Domain.Authorization;
using EDGE.Application.Common.Interfaces;
using EDGE.Infrastructure.Services;

namespace EDGE.Infrastructure.Authorization;

public static class AuthorizationServiceExtensions
{
    public static IServiceCollection AddDynamicAuthorization(this IServiceCollection services)
    {
        services.AddScoped<IUserAuthorizationService, UserAuthorizationService>();
        services.AddScoped<IAuthorizationHandler, PermissionAuthorizationHandler>();
        services.AddScoped<IAuthorizationHandler, RoleAuthorizationHandler>();
        services.AddSingleton<IAuthorizationPolicyProvider, DynamicAuthorizationPolicyProvider>();

        services.AddAuthorization(options =>
        {
            options.AddPolicy(Policies.CanSubmitApplication, policy =>
                policy.AddRequirements(new PermissionRequirement(Permissions.SubmitApplication)));

            options.AddPolicy(Policies.CanViewOwnApplications, policy =>
                policy.AddRequirements(new PermissionRequirement(Permissions.ViewOwnApplications)));

            options.AddPolicy(Policies.CanViewAllApplications, policy =>
                policy.AddRequirements(new PermissionRequirement(Permissions.ViewAllApplications)));

            options.AddPolicy(Policies.CanEvaluateApplication, policy =>
                policy.AddRequirements(new PermissionRequirement(Permissions.EvaluateApplication)));

            options.AddPolicy(Policies.CanApproveApplication, policy =>
                policy.AddRequirements(new PermissionRequirement(Permissions.ApproveApplication)));

            options.AddPolicy(Policies.CanCreateBilling, policy =>
                policy.AddRequirements(new PermissionRequirement(Permissions.CreateBilling)));

            options.AddPolicy(Policies.CanCollectPayment, policy =>
                policy.AddRequirements(new PermissionRequirement(Permissions.CollectPayment)));

            options.AddPolicy(Policies.CanManageUsers, policy =>
                policy.AddRequirements(new PermissionRequirement(Permissions.ManageUsers)));

            options.AddPolicy(Policies.AdminOnly, policy =>
                policy.AddRequirements(new RoleRequirement("admin")));
        });

        return services;
    }
}
