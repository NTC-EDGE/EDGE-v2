using System;
using System.Collections.Generic;

namespace EDGE.Domain.Authorization;

/// <summary>
/// Centralized authorization policy and helper for evaluating administrative roles, claims, and identities.
/// Eliminates fragmented string matching across service layers.
/// </summary>
public static class AdministrativeIdentityPolicy
{
    private static readonly HashSet<string> AdministrativeRoleKeys = new(StringComparer.OrdinalIgnoreCase)
    {
        "admin",
        "administrator",
        "superadmin",
        "super_admin",
        "super-admin",
        "systemadmin",
        "system_admin",
        "system-admin",
        "tenantadmin",
        "tenant_admin",
        "tenant-admin",
        "regionaladmin",
        "regional_admin",
        "regional-admin",
        "regionaldirector",
        "regional_director",
        "regional-director",
        "director"
    };

    private static readonly HashSet<string> SuperAdminRoleKeys = new(StringComparer.OrdinalIgnoreCase)
    {
        "superadmin",
        "super_admin",
        "super-admin",
        "org:superadmin",
        "org:super_admin"
    };

    private static readonly HashSet<string> SeedAdministrativeEmails = new(StringComparer.OrdinalIgnoreCase)
    {
        "superadmin@ntcedge.com",
        "admin@ntcedge.com"
    };

    private static readonly HashSet<string> SeedSuperAdminEmails = new(StringComparer.OrdinalIgnoreCase)
    {
        "superadmin@ntcedge.com"
    };

    /// <summary>
    /// Checks whether a given role key, role name, or claim indicates an administrative role.
    /// </summary>
    public static bool IsAdministrativeRole(string? roleKey)
    {
        if (string.IsNullOrWhiteSpace(roleKey)) return false;
        var trimmed = roleKey.Trim();
        if (AdministrativeRoleKeys.Contains(trimmed)) return true;
        var normalized = trimmed.Replace("-", "").Replace("_", "").Replace(" ", "");
        return AdministrativeRoleKeys.Contains(normalized);
    }

    /// <summary>
    /// Checks whether a given role key, role name, or claim indicates a super administrator role.
    /// </summary>
    public static bool IsSuperAdminRole(string? roleKey)
    {
        if (string.IsNullOrWhiteSpace(roleKey)) return false;
        var trimmed = roleKey.Trim();
        return SuperAdminRoleKeys.Contains(trimmed);
    }

    /// <summary>
    /// Checks whether an email matches a known seed administrative account.
    /// </summary>
    public static bool IsAdministrativeEmail(string? email)
    {
        if (string.IsNullOrWhiteSpace(email)) return false;
        var clean = email.Trim().ToLowerInvariant();
        return SeedAdministrativeEmails.Contains(clean);
    }

    /// <summary>
    /// Checks whether an email matches a known seed super administrator account.
    /// </summary>
    public static bool IsSuperAdminEmail(string? email)
    {
        if (string.IsNullOrWhiteSpace(email)) return false;
        var clean = email.Trim().ToLowerInvariant();
        return SeedSuperAdminEmails.Contains(clean);
    }
}
