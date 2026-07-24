using System;
using Microsoft.AspNetCore.Authorization;

namespace EDGE.Infrastructure.Authorization;

/// <summary>
/// Specifies that the endpoint requires a dynamic role requirement.
/// Leverages <see cref="DynamicAuthorizationPolicyProvider"/> to generate requirements on the fly.
/// </summary>
[AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, AllowMultiple = true, Inherited = true)]
public class HasRoleAttribute : AuthorizeAttribute
{
    public HasRoleAttribute(string role)
        : base(policy: $"Role:{role}")
    {
    }
}
