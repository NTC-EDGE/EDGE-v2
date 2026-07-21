namespace EDGE.Domain.Authorization;

public static class Policies
{
    public const string CanSubmitApplication = "CanSubmitApplication";
    public const string CanViewOwnApplications = "CanViewOwnApplications";
    public const string CanViewAllApplications = "CanViewAllApplications";
    public const string CanEvaluateApplication = "CanEvaluateApplication";
    public const string CanApproveApplication = "CanApproveApplication";
    public const string CanCreateBilling = "CanCreateBilling";
    public const string CanCollectPayment = "CanCollectPayment";
    public const string CanManageUsers = "CanManageUsers";
    public const string AdminOnly = "AdminOnly";
}
