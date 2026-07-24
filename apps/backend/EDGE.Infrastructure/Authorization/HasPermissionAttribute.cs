using System;
using Microsoft.AspNetCore.Authorization;

namespace EDGE.Infrastructure.Authorization;

/// <summary>
/// Specifies that the endpoint requires a dynamic application permission.
/// Leverages <see cref="DynamicAuthorizationPolicyProvider"/> to generate requirements on the fly.
/// </summary>
[AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, AllowMultiple = true, Inherited = true)]
public class HasPermissionAttribute : AuthorizeAttribute
{
    public HasPermissionAttribute(string permission)
        : base(policy: $"Permission:{permission}")
    {
    }
}
