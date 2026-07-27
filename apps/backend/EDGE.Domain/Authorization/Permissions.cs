namespace EDGE.Domain.Authorization;

public static class Permissions
{
    // Applications
    public const string SubmitApplication = "applications.submit";
    public const string ViewOwnApplications = "applications.view_own";
    public const string ViewAllApplications = "applications.view_all";
    public const string ReadApplication = "applications.read";
    public const string UpdateApplication = "applications.update";
    public const string DeleteApplication = "applications.delete";
    public const string EvaluateApplication = "applications.evaluate";
    public const string ApproveApplication = "applications.approve";
    public const string ImportCsvApplications = "applications.import_csv";

    // Services Catalog
    public const string ReadServices = "services.read";
    public const string CreateServices = "services.create";
    public const string UpdateServices = "services.update";
    public const string DeleteServices = "services.delete";

    // Requirements Catalog & Rules
    public const string ReadRequirements = "requirements.read";
    public const string CreateRequirements = "requirements.create";
    public const string UpdateRequirements = "requirements.update";
    public const string DeleteRequirements = "requirements.delete";

    // Users
    public const string ReadUsers = "users.read";
    public const string ManageUsers = "users.manage";
    public const string UpdateUsers = "users.update";
    public const string DeleteUsers = "users.delete";
    public const string SupportDiagnostics = "users.support_diagnostics";

    // Roles & Permissions
    public const string ReadRoles = "roles.read";
    public const string CreateRoles = "roles.create";
    public const string UpdateRoles = "roles.update";
    public const string DeleteRoles = "roles.delete";
    public const string AssignRolePermissions = "roles.permissions_assign";
    public const string RevokeRolePermissions = "roles.permissions_revoke";

    // Tenants & Members
    public const string ReadTenants = "tenants.read";
    public const string CreateTenants = "tenants.create";
    public const string UpdateTenants = "tenants.update";
    public const string DeleteTenants = "tenants.delete";
    public const string ManageTenantMembers = "tenants.members_manage";

    // Storage
    public const string UploadStorage = "storage.upload";
    public const string ReadStorage = "storage.read";
    public const string DownloadStorage = "storage.download";
    public const string DeleteStorage = "storage.delete";

    // Notes
    public const string ReadNotes = "notes.read";
    public const string CreateNotes = "notes.create";
    public const string UpdateNotes = "notes.update";
    public const string DeleteNotes = "notes.delete";

    // Billing
    public const string CreateBilling = "billing.create";
    public const string CollectPayment = "billing.collect";

    // System
    public const string SystemAdmin = "system.admin";

    public static readonly IReadOnlySet<string> AllKeys = new HashSet<string>
    {
        SubmitApplication,
        ViewOwnApplications,
        ViewAllApplications,
        ReadApplication,
        UpdateApplication,
        DeleteApplication,
        EvaluateApplication,
        ApproveApplication,
        ImportCsvApplications,

        ReadServices,
        CreateServices,
        UpdateServices,
        DeleteServices,

        ReadRequirements,
        CreateRequirements,
        UpdateRequirements,
        DeleteRequirements,

        ReadUsers,
        ManageUsers,
        UpdateUsers,
        DeleteUsers,
        SupportDiagnostics,

        ReadRoles,
        CreateRoles,
        UpdateRoles,
        DeleteRoles,
        AssignRolePermissions,
        RevokeRolePermissions,

        ReadTenants,
        CreateTenants,
        UpdateTenants,
        DeleteTenants,
        ManageTenantMembers,

        UploadStorage,
        ReadStorage,
        DownloadStorage,
        DeleteStorage,

        ReadNotes,
        CreateNotes,
        UpdateNotes,
        DeleteNotes,

        CreateBilling,
        CollectPayment,
        SystemAdmin
    };
}
