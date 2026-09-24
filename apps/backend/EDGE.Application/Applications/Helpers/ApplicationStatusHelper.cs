using System;
using EDGE.Domain.Enums;

namespace EDGE.Application.Applications.Helpers;

public static class ApplicationStatusHelper
{
    public static string DetermineQueueTab(ApplicationStatus status, string? role = null)
    {
        var normalizedRole = (role ?? string.Empty).Trim().ToLowerInvariant();

        if (normalizedRole == "accountant")
        {
            if (status == ApplicationStatus.ForAccountant) return "pending";
            if (status == ApplicationStatus.PendingPayment || status == ApplicationStatus.Approved || status == ApplicationStatus.Completed || status == ApplicationStatus.Returned) return "history";
            return "activity";
        }

        if (normalizedRole == "cashier")
        {
            if (status == ApplicationStatus.PendingPayment) return "pending";
            if (status == ApplicationStatus.Completed || status == ApplicationStatus.Approved || status == ApplicationStatus.Returned) return "history";
            return "activity";
        }

        if (normalizedRole == "evaluator" || normalizedRole == "chief of eod" || normalizedRole == "regional director")
        {
            if (status == ApplicationStatus.Submitted || status == ApplicationStatus.Evaluating) return "pending";
            if (status == ApplicationStatus.ForAccountant || status == ApplicationStatus.PendingPayment || status == ApplicationStatus.Approved || status == ApplicationStatus.Completed || status == ApplicationStatus.Returned) return "history";
            return "activity";
        }

        // Default / Admin
        if (status == ApplicationStatus.Submitted || status == ApplicationStatus.Evaluating || status == ApplicationStatus.ForAccountant || status == ApplicationStatus.PendingPayment)
        {
            return "pending";
        }
        if (status == ApplicationStatus.Approved || status == ApplicationStatus.Returned || status == ApplicationStatus.Completed)
        {
            return "history";
        }
        return "activity";
    }
}
