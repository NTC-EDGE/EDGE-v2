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
    public const string IssueApplication = "applications.issue";
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
    public const string CreateUsers = "users.create";
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

    // Service Notes
    public const string ReadServiceNotes = "service_notes.read";
    public const string CreateServiceNotes = "service_notes.create";
    public const string UpdateServiceNotes = "service_notes.update";
    public const string DeleteServiceNotes = "service_notes.delete";

    // SOA Notes
    public const string ReadSoaNotes = "soa_notes.read";
    public const string CreateSoaNotes = "soa_notes.create";
    public const string UpdateSoaNotes = "soa_notes.update";
    public const string DeleteSoaNotes = "soa_notes.delete";

    // Legacy aliases
    public const string ReadNotes = ReadServiceNotes;
    public const string CreateNotes = CreateServiceNotes;
    public const string UpdateNotes = UpdateServiceNotes;
    public const string DeleteNotes = DeleteServiceNotes;

    // Billing & Fees
    public const string CreateBilling = "billing.create";
    public const string ApproveSoa = "billing.soa_approve";
    public const string ReturnSoa = "billing.soa_return";
    public const string CollectPayment = "billing.collect";
    public const string ReturnOp = "billing.op_return";

    // Receipt Management & Cashiering
    public const string ReceiptsRead = "receipts.read";
    public const string ReceiptsBundleEntry = "receipts.bundle_entry";
    public const string ReceiptsIssue = "receipts.issue";
    public const string ReceiptsEdit = "receipts.edit";
    public const string ReceiptsCancel = "receipts.cancel";
    public const string ReceiptsDeposit = "receipts.deposit";
    public const string BankAccountsManage = "bank_accounts.manage";
    public const string CashierReports = "reports.cashier";

    // Schedules
    public const string ReadSchedules = "schedules.read";
    public const string CreateSchedules = "schedules.create";
    public const string UpdateSchedules = "schedules.update";
    public const string DeleteSchedules = "schedules.delete";
    public const string PublishSchedules = "schedules.publish";

    // Communication & Collaboration (Chat & Meetings)
    public const string ReadChat = "chat.read";
    public const string CreateChat = "chat.create";
    public const string ManageChatParticipants = "chat.participants_manage";
    public const string SendChat = "chat.send";

    public const string ReadMeetings = "meetings.read";
    public const string CreateMeetings = "meetings.create";
    public const string ManageMeetingParticipants = "meetings.participants_manage";
    public const string ManageMeetingHostControls = "meetings.host_controls";

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
        new(IssueApplication, "Applications", "Issue Application", PermissionScope.Internal, "Allows configuring form numbers and assigning new licenses upon payment verification"),
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
        new(CreateUsers, "Users Management", "Create Users", PermissionScope.Internal, "Allows creating new staff and system user accounts via Clerk"),
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
        new(ReadTenants, "Tenants Management", "Read Tenants", PermissionScope.Internal, "Allows viewing organization tenants"),
        new(CreateTenants, "Tenants Management", "Create Tenants", PermissionScope.SystemAdmin, "Allows provisioning new tenants"),
        new(UpdateTenants, "Tenants Management", "Update Tenants", PermissionScope.SystemAdmin, "Allows updating tenant settings"),
        new(DeleteTenants, "Tenants Management", "Delete Tenants", PermissionScope.SystemAdmin, "Allows removing organization tenants"),
        new(ManageTenantMembers, "Tenants Management", "Manage Members", PermissionScope.SystemAdmin, "Allows managing tenant membership"),

        // Storage
        new(UploadStorage, "Storage", "Upload Attachments", PermissionScope.Internal, "Allows uploading document attachments"),
        new(ReadStorage, "Storage", "Read Attachments", PermissionScope.Internal, "Allows viewing document attachment metadata"),
        new(DownloadStorage, "Storage", "Download Attachments", PermissionScope.Internal, "Allows downloading document attachments"),
        new(DeleteStorage, "Storage", "Delete Attachments", PermissionScope.Internal, "Allows removing document attachments"),

        // Service Notes
        new(ReadServiceNotes, "Service Notes", "Read Service Notes", PermissionScope.Internal, "Allows viewing service compliance notes"),
        new(CreateServiceNotes, "Service Notes", "Create Service Notes", PermissionScope.Internal, "Allows adding compliance notes to services"),
        new(UpdateServiceNotes, "Service Notes", "Update Service Notes", PermissionScope.Internal, "Allows editing service compliance notes"),
        new(DeleteServiceNotes, "Service Notes", "Delete Service Notes", PermissionScope.Internal, "Allows deleting service compliance notes"),

        // SOA Notes
        new(ReadSoaNotes, "SOA Notes", "Read SOA Notes", PermissionScope.Internal, "Allows viewing Statement of Account note templates"),
        new(CreateSoaNotes, "SOA Notes", "Create SOA Notes", PermissionScope.Internal, "Allows creating Statement of Account note templates"),
        new(UpdateSoaNotes, "SOA Notes", "Update SOA Notes", PermissionScope.Internal, "Allows editing Statement of Account note templates"),
        new(DeleteSoaNotes, "SOA Notes", "Delete SOA Notes", PermissionScope.Internal, "Allows deleting Statement of Account note templates"),

        // Billing
        new(CreateBilling, "Billing & Fees", "Create Billing", PermissionScope.Internal, "Allows generating fee order of payment"),
        new(ApproveSoa, "Billing & Fees", "Approve SOA", PermissionScope.Internal, "Allows approving Statements of Account"),
        new(ReturnSoa, "Billing & Fees", "Return SOA", PermissionScope.Internal, "Allows returning Statements of Account to evaluator"),
        new(CollectPayment, "Billing & Fees", "Collect Payment", PermissionScope.Internal, "Allows processing fee payments"),
        new(ReturnOp, "Billing & Fees", "Return OP", PermissionScope.Internal, "Allows returning Orders of Payment"),

        // Receipt Management & Cashiering
        new(ReceiptsRead, "Receipt Management", "Read Receipts & Booklets", PermissionScope.Internal, "Allows viewing official receipts, booklets, and cashier records"),
        new(ReceiptsBundleEntry, "Receipt Management", "Entry OR Bundles", PermissionScope.Internal, "Allows registering and configuring new 50-pcs Official Receipt booklets and series"),
        new(ReceiptsIssue, "Receipt Management", "Issue Official Receipts", PermissionScope.Internal, "Allows collecting payments and issuing Official Receipts from active series"),
        new(ReceiptsEdit, "Receipt Management", "Edit Receipts", PermissionScope.Internal, "Allows editing receipt line items and payor details during cashier transactions"),
        new(ReceiptsCancel, "Receipt Management", "Cancel Official Receipts", PermissionScope.Internal, "Allows voiding/canceling issued Official Receipts with mandatory audit reasons"),
        new(ReceiptsDeposit, "Receipt Management", "Manage Bank Deposits", PermissionScope.Internal, "Allows creating and managing remittance deposit batches for bank accounts"),
        new(BankAccountsManage, "Receipt Management", "Manage Bank Accounts", PermissionScope.Internal, "Allows creating and managing government depositary bank accounts"),
        new(CashierReports, "Receipt Management", "View Cashier Reports", PermissionScope.Internal, "Allows generating Report of Collections and Deposits (RCD) and cancellation summaries"),

        // Schedules
        new(ReadSchedules, "Schedules", "Read Schedules", PermissionScope.Internal, "Allows viewing examination and appointment schedules for the regional tenant"),
        new(CreateSchedules, "Schedules", "Create Schedules", PermissionScope.Internal, "Allows creating examination and appointment schedules for the regional tenant"),
        new(UpdateSchedules, "Schedules", "Update Schedules", PermissionScope.Internal, "Allows editing examination and appointment schedules for the regional tenant"),
        new(DeleteSchedules, "Schedules", "Delete Schedules", PermissionScope.Internal, "Allows removing draft examination and appointment schedules for the regional tenant"),
        new(PublishSchedules, "Schedules", "Publish Schedules", PermissionScope.Internal, "Allows publishing or unpublishing examination schedules for public applicant viewing"),

        // Communication & Collaboration
        new(ReadChat, "Communication", "Access Chat", PermissionScope.Internal, "Allows accessing chat and team discussions"),
        new(CreateChat, "Communication", "Create Conversations", PermissionScope.Internal, "Allows creating direct and group chat channels"),
        new(ManageChatParticipants, "Communication", "Manage Chat Participants", PermissionScope.Internal, "Allows adding and removing participants from chat channels"),
        new(SendChat, "Communication", "Send Chat Messages", PermissionScope.Internal, "Allows sending messages and attachments in chat channels"),
        new(ReadMeetings, "Communication", "Access Meetings", PermissionScope.Internal, "Allows accessing video meetings and conferences"),
        new(CreateMeetings, "Communication", "Create Meetings", PermissionScope.Internal, "Allows scheduling and hosting video meetings"),
        new(ManageMeetingParticipants, "Communication", "Manage Meeting Participants", PermissionScope.Internal, "Allows inviting and removing participants in meetings"),
        new(ManageMeetingHostControls, "Communication", "Meeting Host Controls", PermissionScope.Internal, "Allows host controls such as muting, spotlighting, and creating polls in meetings"),

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
