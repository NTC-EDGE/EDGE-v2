using System;
using EDGE.Domain.Authorization;
using EDGE.Domain.Enums;

namespace EDGE.Application.Applications.Helpers;

public static class ApplicationStatusHelper
{
    public static string DetermineQueueTab(
        ApplicationStatus status,
        string? role = null,
        bool hasSoa = false,
        bool hasOp = false,
        string? remarks = null,
        bool hasAccountantHistory = false,
        bool hasCashierHistory = false)
    {
        if (status == ApplicationStatus.ForIssuance)
        {
            return "issuance";
        }

        if (IsAccountantRole(role))
        {
            if (status == ApplicationStatus.ForAccountant) return "pending";
            bool hasPassedAccountant = hasSoa ||
                                       hasAccountantHistory ||
                                       (remarks != null && remarks.Contains("Accountant", StringComparison.OrdinalIgnoreCase)) ||
                                       status == ApplicationStatus.PendingPayment ||
                                       status == ApplicationStatus.ForIssuance ||
                                       status == ApplicationStatus.Approved ||
                                       status == ApplicationStatus.Completed ||
                                       status == ApplicationStatus.Returned;
            if (hasPassedAccountant) return "history";
            return "activity";
        }

        if (IsCashierRole(role))
        {
            if (status == ApplicationStatus.PendingPayment) return "pending";
            bool hasPassedCashier = hasOp ||
                                    hasCashierHistory ||
                                    (remarks != null && remarks.Contains("Cashier", StringComparison.OrdinalIgnoreCase)) ||
                                    status == ApplicationStatus.ForIssuance ||
                                    status == ApplicationStatus.Completed ||
                                    status == ApplicationStatus.Approved ||
                                    status == ApplicationStatus.Returned;
            if (hasPassedCashier) return "history";
            return "activity";
        }

        if (IsEvaluatorOrSupervisorRole(role))
        {
            if (status == ApplicationStatus.Submitted || status == ApplicationStatus.Evaluating || status == ApplicationStatus.Returned) return "pending";
            if (status == ApplicationStatus.ForAccountant || status == ApplicationStatus.PendingPayment || status == ApplicationStatus.Approved || status == ApplicationStatus.Completed) return "history";
            return "activity";
        }

        // Default / Admin
        if (status == ApplicationStatus.Submitted || status == ApplicationStatus.Evaluating || status == ApplicationStatus.Returned || status == ApplicationStatus.ForAccountant || status == ApplicationStatus.PendingPayment)
        {
            return "pending";
        }
        if (status == ApplicationStatus.Approved || status == ApplicationStatus.Completed)
        {
            return "history";
        }
        return "activity";
    }

    public static bool IsAccountantRole(string? role) =>
        string.Equals(role, SystemRoles.Accountant, StringComparison.OrdinalIgnoreCase);

    public static bool IsCashierRole(string? role) =>
        string.Equals(role, SystemRoles.Cashier, StringComparison.OrdinalIgnoreCase);

    public static bool IsEvaluatorOrSupervisorRole(string? role) =>
        string.Equals(role, SystemRoles.Evaluator, StringComparison.OrdinalIgnoreCase) ||
        string.Equals(role, SystemRoles.ChiefOfEod, StringComparison.OrdinalIgnoreCase) ||
        string.Equals(role, SystemRoles.RegionalDirector, StringComparison.OrdinalIgnoreCase);
}
