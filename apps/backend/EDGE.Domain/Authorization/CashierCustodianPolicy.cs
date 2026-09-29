using System;
using System.Linq;
using EDGE.Domain.Entities;

namespace EDGE.Domain.Authorization;

/// <summary>
/// Domain policy determining whether a tenant member is authorized to act as an Official Receipt (OR) booklet custodian.
/// Enforces government role-based access control (RBAC) and separation of duties.
/// </summary>
public static class CashierCustodianPolicy
{
    /// <summary>
    /// Evaluates if the given tenant membership is authorized for cashiering and booklet custody.
    /// </summary>
    public static bool IsAuthorizedCashier(User user, TenantMember? membership)
    {
        if (membership == null) return false;

        // 1. Primary RBAC check: Does the user's role have permission to issue receipts or collect fee payments?
        if (membership.Role?.RolePermissions != null && membership.Role.RolePermissions.Count > 0)
        {
            var hasCashierPermission = membership.Role.RolePermissions.Any(rp =>
                rp.PermissionKey == Permissions.ReceiptsIssue ||
                rp.PermissionKey == Permissions.CollectPayment ||
                rp.PermissionKey == Permissions.ReceiptsBundleEntry);

            if (hasCashierPermission)
            {
                return true;
            }
        }

        // 2. Secondary check: Role key / role name matching
        var roleKey = membership.Role?.Key?.ToLowerInvariant() ?? string.Empty;
        var roleName = membership.Role?.Name?.ToLowerInvariant() ?? string.Empty;
        var position = membership.Position?.ToLowerInvariant() ?? string.Empty;
        var jobTitle = membership.JobTitle?.ToLowerInvariant() ?? string.Empty;
        var designation = membership.Designation?.ToLowerInvariant() ?? string.Empty;

        // Explicitly reject roles that are distinct non-cashier positions (Accountant, Evaluator, Legal, Records)
        if (roleKey.Contains("accountant") || roleName.Contains("accountant") ||
            roleKey.Contains("evaluat") || roleName.Contains("evaluat") ||
            roleKey.Contains("legal") || roleName.Contains("legal") ||
            roleKey.Contains("record") || roleName.Contains("record"))
        {
            return false;
        }

        return roleKey == "cashier" ||
               roleKey.Contains("cashier") ||
               roleName.Contains("cashier") ||
               position.Contains("cashier") ||
               jobTitle.Contains("cashier") ||
               designation.Contains("cashier") ||
               roleKey.Contains("collect") ||
               roleName.Contains("collect") ||
               AdministrativeIdentityPolicy.IsAdministrativeRole(roleKey) ||
               AdministrativeIdentityPolicy.IsAdministrativeRole(roleName);
    }
}
