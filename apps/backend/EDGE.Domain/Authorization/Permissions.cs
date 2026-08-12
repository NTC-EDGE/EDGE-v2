using System.Collections.Generic;
using System.Linq;

namespace EDGE.Domain.Authorization;

public enum PermissionScope
{
    Internal,
    SystemAdmin
}

public record PermissionDefinition(
    string Key,
    string Category,
    string Label,
    PermissionScope Scope,
    string Description
);

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
    public const string ReadServiceVariantElements = "services.variant_elements.read";
    public const string CreateServiceVariantElements = "services.variant_elements.create";
    public const string UpdateServiceVariantElements = "services.variant_elements.update";
    public const string DeleteServiceVariantElements = "services.variant_elements.delete";

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

    // Billing & Fees
    public const string CreateBilling = "billing.create";
    public const string ApproveSoa = "billing.soa_approve";
    public const string ReturnSoa = "billing.soa_return";
    public const string CollectPayment = "billing.collect";
    public const string ReturnOp = "billing.op_return";

    // System
    public const string SystemAdmin = "system.admin";

    // Strongly-Typed Definitions Array
    public static readonly IReadOnlyList<PermissionDefinition> Definitions = new List<PermissionDefinition>
    {
        // Applications
        new(SubmitApplication, "Applications", "Submit Application", PermissionScope.Internal, "Allows submitting new service applications"),
        new(ViewOwnApplications, "Applications", "View Own Applications", PermissionScope.Internal, "Allows viewing own submitted applications"),
        new(ViewAllApplications, "Applications", "View All Applications", PermissionScope.Internal, "Allows viewing all applications across department"),
        new(ReadApplication, "Applications", "Read Application Details", PermissionScope.Internal, "Allows viewing details of any application"),
        new(UpdateApplication, "Applications", "Update Application", PermissionScope.Internal, "Allows editing application details"),
        new(DeleteApplication, "Applications", "Delete Application", PermissionScope.Internal, "Allows removing or canceling applications"),
        new(EvaluateApplication, "Applications", "Evaluate Application", PermissionScope.Internal, "Allows conducting technical evaluation on applications"),
        new(ApproveApplication, "Applications", "Approve Application", PermissionScope.Internal, "Allows issuing final approval or rejection"),
        new(ImportCsvApplications, "Applications", "Import Applications CSV", PermissionScope.Internal, "Allows batch importing applications via CSV"),

        // Services Catalog
        new(ReadServices, "Services Catalog", "Read Services", PermissionScope.Internal, "Allows viewing service catalog"),
        new(CreateServices, "Services Catalog", "Create Services", PermissionScope.Internal, "Allows adding new services to catalog"),
        new(UpdateServices, "Services Catalog", "Update Services", PermissionScope.Internal, "Allows modifying service definitions"),
        new(DeleteServices, "Services Catalog", "Delete Services", PermissionScope.Internal, "Allows removing services from catalog"),
        new(ReadServiceVariantElements, "Services Catalog", "Read Variant Elements", PermissionScope.Internal, "Allows viewing exam elements attached to service variants"),
        new(CreateServiceVariantElements, "Services Catalog", "Create Variant Elements", PermissionScope.Internal, "Allows adding exam elements to service variants"),
        new(UpdateServiceVariantElements, "Services Catalog", "Update Variant Elements", PermissionScope.Internal, "Allows editing exam elements on service variants"),
        new(DeleteServiceVariantElements, "Services Catalog", "Delete Variant Elements", PermissionScope.Internal, "Allows removing exam elements from service variants"),

        // Requirements & Rules
        new(ReadRequirements, "Requirements Catalog", "Read Requirements", PermissionScope.Internal, "Allows viewing permit requirement rules"),
        new(CreateRequirements, "Requirements Catalog", "Create Requirements", PermissionScope.Internal, "Allows adding requirement rules to services"),
        new(UpdateRequirements, "Requirements Catalog", "Update Requirements", PermissionScope.Internal, "Allows editing existing requirement rules"),
        new(DeleteRequirements, "Requirements Catalog", "Delete Requirements", PermissionScope.Internal, "Allows removing requirement rules"),

        // Users
        new(ReadUsers, "Users Management", "Read Users", PermissionScope.Internal, "Allows searching and viewing user directory"),
        new(UpdateUsers, "Users Management", "Update Users", PermissionScope.Internal, "Allows updating user profile information"),
        new(DeleteUsers, "Users Management", "Delete Users", PermissionScope.Internal, "Allows deactivating or removing user accounts"),
        new(ManageUsers, "Users Management", "Manage Users", PermissionScope.SystemAdmin, "Allows full administrative user management"),
        new(SupportDiagnostics, "Users Management", "Support Diagnostics", PermissionScope.SystemAdmin, "Allows accessing system diagnostic tools"),

        // Roles & Permissions
        new(ReadRoles, "Roles & Permissions", "Read Roles", PermissionScope.Internal, "Allows viewing roles and permission mappings"),
        new(CreateRoles, "Roles & Permissions", "Create Roles", PermissionScope.Internal, "Allows creating new security roles"),
        new(UpdateRoles, "Roles & Permissions", "Update Roles", PermissionScope.Internal, "Allows updating role names and permissions"),
        new(DeleteRoles, "Roles & Permissions", "Delete Roles", PermissionScope.Internal, "Allows deleting custom security roles"),
        new(AssignRolePermissions, "Roles & Permissions", "Assign Permissions", PermissionScope.Internal, "Allows assigning permissions to roles"),
        new(RevokeRolePermissions, "Roles & Permissions", "Revoke Permissions", PermissionScope.Internal, "Allows revoking permissions from roles"),

        // Tenants & Members
        new(ReadTenants, "Tenants Management", "Read Tenants", PermissionScope.SystemAdmin, "Allows viewing organization tenants"),
        new(CreateTenants, "Tenants Management", "Create Tenants", PermissionScope.SystemAdmin, "Allows provisioning new tenants"),
        new(UpdateTenants, "Tenants Management", "Update Tenants", PermissionScope.SystemAdmin, "Allows updating tenant settings"),
        new(DeleteTenants, "Tenants Management", "Delete Tenants", PermissionScope.SystemAdmin, "Allows removing organization tenants"),
        new(ManageTenantMembers, "Tenants Management", "Manage Members", PermissionScope.SystemAdmin, "Allows managing tenant membership"),

        // Storage
        new(UploadStorage, "Storage", "Upload Attachments", PermissionScope.Internal, "Allows uploading document attachments"),
        new(ReadStorage, "Storage", "Read Attachments", PermissionScope.Internal, "Allows viewing document attachment metadata"),
        new(DownloadStorage, "Storage", "Download Attachments", PermissionScope.Internal, "Allows downloading document attachments"),
        new(DeleteStorage, "Storage", "Delete Attachments", PermissionScope.Internal, "Allows removing document attachments"),

        // Notes
        new(ReadNotes, "Internal Notes", "Read Notes", PermissionScope.Internal, "Allows viewing application internal notes"),
        new(CreateNotes, "Internal Notes", "Create Notes", PermissionScope.Internal, "Allows adding internal notes to applications"),
        new(UpdateNotes, "Internal Notes", "Update Notes", PermissionScope.Internal, "Allows editing internal notes"),
        new(DeleteNotes, "Internal Notes", "Delete Notes", PermissionScope.Internal, "Allows deleting internal notes"),

        // Billing
        new(CreateBilling, "Billing & Fees", "Create Billing", PermissionScope.Internal, "Allows generating fee order of payment"),
        new(ApproveSoa, "Billing & Fees", "Approve SOA", PermissionScope.Internal, "Allows approving Statements of Account"),
        new(ReturnSoa, "Billing & Fees", "Return SOA", PermissionScope.Internal, "Allows returning Statements of Account to evaluator"),
        new(CollectPayment, "Billing & Fees", "Collect Payment", PermissionScope.Internal, "Allows processing fee payments"),
        new(ReturnOp, "Billing & Fees", "Return OP", PermissionScope.Internal, "Allows returning Orders of Payment"),

        // System
        new(SystemAdmin, "System", "System Administrator", PermissionScope.SystemAdmin, "Full system administration access")
    };

    public static readonly IReadOnlySet<string> AllKeys = Definitions.Select(d => d.Key).ToHashSet();

    public static readonly IReadOnlyList<PermissionDefinition> InternalPermissions = Definitions
        .Where(d => d.Scope == PermissionScope.Internal)
        .ToList();

    public static readonly IReadOnlyList<PermissionDefinition> SystemAdminPermissions = Definitions
        .Where(d => d.Scope == PermissionScope.SystemAdmin)
        .ToList();
}
