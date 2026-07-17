namespace EDGE.Domain.Authorization;

public static class Permissions
{
    public const string SubmitApplication = "applications.submit";
    public const string ViewOwnApplications = "applications.view_own";
    public const string ViewAllApplications = "applications.view_all";
    public const string EvaluateApplication = "applications.evaluate";
    public const string ApproveApplication = "applications.approve";
    public const string CreateBilling = "billing.create";
    public const string CollectPayment = "billing.collect";
    public const string ManageUsers = "users.manage";
    public const string SystemAdmin = "system.admin";
}
