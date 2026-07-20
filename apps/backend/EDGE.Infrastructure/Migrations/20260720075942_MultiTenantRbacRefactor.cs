using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace EDGE.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class MultiTenantRbacRefactor : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_RolePermissions_Permissions_PermissionId",
                schema: "public",
                table: "RolePermissions");

            migrationBuilder.DropForeignKey(
                name: "FK_Users_Roles_RoleId",
                schema: "public",
                table: "Users");

            migrationBuilder.DropTable(
                name: "Permissions",
                schema: "public");

            migrationBuilder.DropIndex(
                name: "IX_Users_RoleId",
                schema: "public",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_RolePermissions_PermissionId",
                schema: "public",
                table: "RolePermissions");

            migrationBuilder.DropIndex(
                name: "IX_RolePermissions_RoleId",
                schema: "public",
                table: "RolePermissions");

            migrationBuilder.DeleteData(
                schema: "public",
                table: "RolePermissions",
                keyColumn: "Id",
                keyValue: new Guid("30000000-0000-0000-0000-000000000001"));

            migrationBuilder.DeleteData(
                schema: "public",
                table: "RolePermissions",
                keyColumn: "Id",
                keyValue: new Guid("30000000-0000-0000-0000-000000000002"));

            migrationBuilder.DeleteData(
                schema: "public",
                table: "RolePermissions",
                keyColumn: "Id",
                keyValue: new Guid("30000000-0000-0000-0000-000000000003"));

            migrationBuilder.DeleteData(
                schema: "public",
                table: "RolePermissions",
                keyColumn: "Id",
                keyValue: new Guid("30000000-0000-0000-0000-000000000004"));

            migrationBuilder.DeleteData(
                schema: "public",
                table: "RolePermissions",
                keyColumn: "Id",
                keyValue: new Guid("30000000-0000-0000-0000-000000000005"));

            migrationBuilder.DeleteData(
                schema: "public",
                table: "RolePermissions",
                keyColumn: "Id",
                keyValue: new Guid("30000000-0000-0000-0000-000000000006"));

            migrationBuilder.DeleteData(
                schema: "public",
                table: "RolePermissions",
                keyColumn: "Id",
                keyValue: new Guid("30000000-0000-0000-0000-000000000007"));

            migrationBuilder.DeleteData(
                schema: "public",
                table: "RolePermissions",
                keyColumn: "Id",
                keyValue: new Guid("30000000-0000-0000-0000-000000000008"));

            migrationBuilder.DeleteData(
                schema: "public",
                table: "RolePermissions",
                keyColumn: "Id",
                keyValue: new Guid("30000000-0000-0000-0000-000000000009"));

            migrationBuilder.DeleteData(
                schema: "public",
                table: "RolePermissions",
                keyColumn: "Id",
                keyValue: new Guid("30000000-0000-0000-0000-000000000010"));

            migrationBuilder.DeleteData(
                schema: "public",
                table: "RolePermissions",
                keyColumn: "Id",
                keyValue: new Guid("30000000-0000-0000-0000-000000000011"));

            migrationBuilder.DeleteData(
                schema: "public",
                table: "RolePermissions",
                keyColumn: "Id",
                keyValue: new Guid("30000000-0000-0000-0000-000000000012"));

            migrationBuilder.DeleteData(
                schema: "public",
                table: "RolePermissions",
                keyColumn: "Id",
                keyValue: new Guid("30000000-0000-0000-0000-000000000013"));

            migrationBuilder.DeleteData(
                schema: "public",
                table: "RolePermissions",
                keyColumn: "Id",
                keyValue: new Guid("30000000-0000-0000-0000-000000000014"));

            migrationBuilder.DeleteData(
                schema: "public",
                table: "RolePermissions",
                keyColumn: "Id",
                keyValue: new Guid("30000000-0000-0000-0000-000000000015"));

            migrationBuilder.DeleteData(
                schema: "public",
                table: "RolePermissions",
                keyColumn: "Id",
                keyValue: new Guid("30000000-0000-0000-0000-000000000016"));

            migrationBuilder.DeleteData(
                schema: "public",
                table: "RolePermissions",
                keyColumn: "Id",
                keyValue: new Guid("30000000-0000-0000-0000-000000000017"));

            migrationBuilder.DeleteData(
                schema: "public",
                table: "RolePermissions",
                keyColumn: "Id",
                keyValue: new Guid("30000000-0000-0000-0000-000000000018"));

            migrationBuilder.DeleteData(
                schema: "public",
                table: "RolePermissions",
                keyColumn: "Id",
                keyValue: new Guid("30000000-0000-0000-0000-000000000019"));

            migrationBuilder.DeleteData(
                schema: "public",
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"));

            migrationBuilder.DeleteData(
                schema: "public",
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"));

            migrationBuilder.DeleteData(
                schema: "public",
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"));

            migrationBuilder.DeleteData(
                schema: "public",
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("44444444-4444-4444-4444-444444444444"));

            migrationBuilder.DeleteData(
                schema: "public",
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("55555555-5555-5555-5555-555555555555"));

            migrationBuilder.DeleteData(
                schema: "public",
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("66666666-6666-6666-6666-666666666666"));

            migrationBuilder.DeleteData(
                schema: "public",
                table: "Roles",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000001"));

            migrationBuilder.DeleteData(
                schema: "public",
                table: "Roles",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000002"));

            migrationBuilder.DeleteData(
                schema: "public",
                table: "Roles",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000003"));

            migrationBuilder.DeleteData(
                schema: "public",
                table: "Roles",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000004"));

            migrationBuilder.DeleteData(
                schema: "public",
                table: "Roles",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000005"));

            migrationBuilder.DeleteData(
                schema: "public",
                table: "Roles",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000006"));

            migrationBuilder.DropColumn(
                name: "RoleId",
                schema: "public",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "PermissionId",
                schema: "public",
                table: "RolePermissions");

            migrationBuilder.AddColumn<bool>(
                name: "IsSuperAdmin",
                schema: "public",
                table: "Users",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsSystemRole",
                schema: "public",
                table: "Roles",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "public",
                table: "Roles",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PermissionKey",
                schema: "public",
                table: "RolePermissions",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "Tenants",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    Slug = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastModifiedBy = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tenants", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TenantMembers",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    RoleId = table.Column<Guid>(type: "uuid", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    JoinedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastModifiedBy = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TenantMembers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TenantMembers_Roles_RoleId",
                        column: x => x.RoleId,
                        principalSchema: "public",
                        principalTable: "Roles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TenantMembers_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalSchema: "public",
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TenantMembers_Users_UserId",
                        column: x => x.UserId,
                        principalSchema: "public",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Roles_TenantId",
                schema: "public",
                table: "Roles",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_RolePermissions_RoleId_PermissionKey",
                schema: "public",
                table: "RolePermissions",
                columns: new[] { "RoleId", "PermissionKey" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TenantMembers_RoleId",
                schema: "public",
                table: "TenantMembers",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "IX_TenantMembers_TenantId_UserId",
                schema: "public",
                table: "TenantMembers",
                columns: new[] { "TenantId", "UserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TenantMembers_UserId",
                schema: "public",
                table: "TenantMembers",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Tenants_Slug",
                schema: "public",
                table: "Tenants",
                column: "Slug",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Roles_Tenants_TenantId",
                schema: "public",
                table: "Roles",
                column: "TenantId",
                principalSchema: "public",
                principalTable: "Tenants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Roles_Tenants_TenantId",
                schema: "public",
                table: "Roles");

            migrationBuilder.DropTable(
                name: "TenantMembers",
                schema: "public");

            migrationBuilder.DropTable(
                name: "Tenants",
                schema: "public");

            migrationBuilder.DropIndex(
                name: "IX_Roles_TenantId",
                schema: "public",
                table: "Roles");

            migrationBuilder.DropIndex(
                name: "IX_RolePermissions_RoleId_PermissionKey",
                schema: "public",
                table: "RolePermissions");

            migrationBuilder.DropColumn(
                name: "IsSuperAdmin",
                schema: "public",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "IsSystemRole",
                schema: "public",
                table: "Roles");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "public",
                table: "Roles");

            migrationBuilder.DropColumn(
                name: "PermissionKey",
                schema: "public",
                table: "RolePermissions");

            migrationBuilder.AddColumn<Guid>(
                name: "RoleId",
                schema: "public",
                table: "Users",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "PermissionId",
                schema: "public",
                table: "RolePermissions",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateTable(
                name: "Permissions",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    Description = table.Column<string>(type: "text", nullable: true),
                    Key = table.Column<string>(type: "text", nullable: false),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastModifiedBy = table.Column<string>(type: "text", nullable: true),
                    Name = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Permissions", x => x.Id);
                });

            migrationBuilder.InsertData(
                schema: "public",
                table: "Permissions",
                columns: new[] { "Id", "CreatedAt", "CreatedBy", "Description", "Key", "LastModifiedAt", "LastModifiedBy", "Name" },
                values: new object[,]
                {
                    { new Guid("20000000-0000-0000-0000-000000000001"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Can submit new applications", "applications.submit", null, null, "Submit Application" },
                    { new Guid("20000000-0000-0000-0000-000000000002"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Can view personal applications", "applications.view_own", null, null, "View Own Applications" },
                    { new Guid("20000000-0000-0000-0000-000000000003"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Can view all applications in system", "applications.view_all", null, null, "View All Applications" },
                    { new Guid("20000000-0000-0000-0000-000000000004"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Can run evaluation checks", "applications.evaluate", null, null, "Evaluate Application" },
                    { new Guid("20000000-0000-0000-0000-000000000005"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Can approve or reject applications", "applications.approve", null, null, "Approve Application" },
                    { new Guid("20000000-0000-0000-0000-000000000006"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Can create bills and invoices", "billing.create", null, null, "Create Billing" },
                    { new Guid("20000000-0000-0000-0000-000000000007"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Can process payments and print receipts", "billing.collect", null, null, "Collect Payment" },
                    { new Guid("20000000-0000-0000-0000-000000000008"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Can update user roles and configurations", "users.manage", null, null, "Manage Users" },
                    { new Guid("20000000-0000-0000-0000-000000000009"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Full system administration capability", "system.admin", null, null, "System Admin Access" }
                });

            migrationBuilder.InsertData(
                schema: "public",
                table: "Roles",
                columns: new[] { "Id", "CreatedAt", "CreatedBy", "Description", "Key", "LastModifiedAt", "LastModifiedBy", "Name" },
                values: new object[,]
                {
                    { new Guid("10000000-0000-0000-0000-000000000001"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "External portal user requesting services", "client", null, null, "Client" },
                    { new Guid("10000000-0000-0000-0000-000000000002"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Staff member performing assessments", "evaluator", null, null, "Evaluator" },
                    { new Guid("10000000-0000-0000-0000-000000000003"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Executive approver of applications", "higherups", null, null, "Higher-Ups" },
                    { new Guid("10000000-0000-0000-0000-000000000004"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Billing and financial administrator", "accountant", null, null, "Accountant" },
                    { new Guid("10000000-0000-0000-0000-000000000005"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Payment processing administrator", "cashier", null, null, "Cashier" },
                    { new Guid("10000000-0000-0000-0000-000000000006"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "System administrator with full access", "admin", null, null, "Administrator" }
                });

            migrationBuilder.InsertData(
                schema: "public",
                table: "RolePermissions",
                columns: new[] { "Id", "CreatedAt", "CreatedBy", "LastModifiedAt", "LastModifiedBy", "PermissionId", "RoleId" },
                values: new object[,]
                {
                    { new Guid("30000000-0000-0000-0000-000000000001"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, null, new Guid("20000000-0000-0000-0000-000000000001"), new Guid("10000000-0000-0000-0000-000000000001") },
                    { new Guid("30000000-0000-0000-0000-000000000002"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, null, new Guid("20000000-0000-0000-0000-000000000002"), new Guid("10000000-0000-0000-0000-000000000001") },
                    { new Guid("30000000-0000-0000-0000-000000000003"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, null, new Guid("20000000-0000-0000-0000-000000000003"), new Guid("10000000-0000-0000-0000-000000000002") },
                    { new Guid("30000000-0000-0000-0000-000000000004"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, null, new Guid("20000000-0000-0000-0000-000000000004"), new Guid("10000000-0000-0000-0000-000000000002") },
                    { new Guid("30000000-0000-0000-0000-000000000005"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, null, new Guid("20000000-0000-0000-0000-000000000003"), new Guid("10000000-0000-0000-0000-000000000003") },
                    { new Guid("30000000-0000-0000-0000-000000000006"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, null, new Guid("20000000-0000-0000-0000-000000000005"), new Guid("10000000-0000-0000-0000-000000000003") },
                    { new Guid("30000000-0000-0000-0000-000000000007"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, null, new Guid("20000000-0000-0000-0000-000000000003"), new Guid("10000000-0000-0000-0000-000000000004") },
                    { new Guid("30000000-0000-0000-0000-000000000008"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, null, new Guid("20000000-0000-0000-0000-000000000006"), new Guid("10000000-0000-0000-0000-000000000004") },
                    { new Guid("30000000-0000-0000-0000-000000000009"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, null, new Guid("20000000-0000-0000-0000-000000000003"), new Guid("10000000-0000-0000-0000-000000000005") },
                    { new Guid("30000000-0000-0000-0000-000000000010"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, null, new Guid("20000000-0000-0000-0000-000000000007"), new Guid("10000000-0000-0000-0000-000000000005") },
                    { new Guid("30000000-0000-0000-0000-000000000011"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, null, new Guid("20000000-0000-0000-0000-000000000001"), new Guid("10000000-0000-0000-0000-000000000006") },
                    { new Guid("30000000-0000-0000-0000-000000000012"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, null, new Guid("20000000-0000-0000-0000-000000000002"), new Guid("10000000-0000-0000-0000-000000000006") },
                    { new Guid("30000000-0000-0000-0000-000000000013"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, null, new Guid("20000000-0000-0000-0000-000000000003"), new Guid("10000000-0000-0000-0000-000000000006") },
                    { new Guid("30000000-0000-0000-0000-000000000014"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, null, new Guid("20000000-0000-0000-0000-000000000004"), new Guid("10000000-0000-0000-0000-000000000006") },
                    { new Guid("30000000-0000-0000-0000-000000000015"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, null, new Guid("20000000-0000-0000-0000-000000000005"), new Guid("10000000-0000-0000-0000-000000000006") },
                    { new Guid("30000000-0000-0000-0000-000000000016"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, null, new Guid("20000000-0000-0000-0000-000000000006"), new Guid("10000000-0000-0000-0000-000000000006") },
                    { new Guid("30000000-0000-0000-0000-000000000017"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, null, new Guid("20000000-0000-0000-0000-000000000007"), new Guid("10000000-0000-0000-0000-000000000006") },
                    { new Guid("30000000-0000-0000-0000-000000000018"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, null, new Guid("20000000-0000-0000-0000-000000000008"), new Guid("10000000-0000-0000-0000-000000000006") },
                    { new Guid("30000000-0000-0000-0000-000000000019"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, null, new Guid("20000000-0000-0000-0000-000000000009"), new Guid("10000000-0000-0000-0000-000000000006") }
                });

            migrationBuilder.InsertData(
                schema: "public",
                table: "Users",
                columns: new[] { "Id", "AuthUserId", "BarangayId", "ContactNumber", "CourseTaken", "CreatedAt", "CreatedBy", "DateOfBirth", "ESignature", "Email", "FirstName", "Height", "IsOnline", "LastModifiedAt", "LastModifiedBy", "LastName", "LastOnline", "MiddleName", "Nationality", "ProfilePicture", "RoleId", "SchoolAttended", "Sex", "Street", "Suffix", "Unit", "Weight", "ZipCode" },
                values: new object[,]
                {
                    { new Guid("11111111-1111-1111-1111-111111111111"), "user_client123", null, null, null, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, null, "client@ntcedge.com", "John", null, null, null, null, "Client", null, null, null, null, new Guid("10000000-0000-0000-0000-000000000001"), null, null, null, null, null, null, null },
                    { new Guid("22222222-2222-2222-2222-222222222222"), "user_evaluator123", null, null, null, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, null, "evaluator@ntcedge.com", "Jane", null, null, null, null, "Evaluator", null, null, null, null, new Guid("10000000-0000-0000-0000-000000000002"), null, null, null, null, null, null, null },
                    { new Guid("33333333-3333-3333-3333-333333333333"), "user_higherups123", null, null, null, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, null, "higherups@ntcedge.com", "Chief", null, null, null, null, "Officer", null, null, null, null, new Guid("10000000-0000-0000-0000-000000000003"), null, null, null, null, null, null, null },
                    { new Guid("44444444-4444-4444-4444-444444444444"), "user_accountant123", null, null, null, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, null, "accountant@ntcedge.com", "Alice", null, null, null, null, "Accountant", null, null, null, null, new Guid("10000000-0000-0000-0000-000000000004"), null, null, null, null, null, null, null },
                    { new Guid("55555555-5555-5555-5555-555555555555"), "user_cashier123", null, null, null, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, null, "cashier@ntcedge.com", "Bob", null, null, null, null, "Cashier", null, null, null, null, new Guid("10000000-0000-0000-0000-000000000005"), null, null, null, null, null, null, null },
                    { new Guid("66666666-6666-6666-6666-666666666666"), "user_admin123", null, null, null, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, null, "admin@ntcedge.com", "Super", null, null, null, null, "Admin", null, null, null, null, new Guid("10000000-0000-0000-0000-000000000006"), null, null, null, null, null, null, null }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Users_RoleId",
                schema: "public",
                table: "Users",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "IX_RolePermissions_PermissionId",
                schema: "public",
                table: "RolePermissions",
                column: "PermissionId");

            migrationBuilder.CreateIndex(
                name: "IX_RolePermissions_RoleId",
                schema: "public",
                table: "RolePermissions",
                column: "RoleId");

            migrationBuilder.AddForeignKey(
                name: "FK_RolePermissions_Permissions_PermissionId",
                schema: "public",
                table: "RolePermissions",
                column: "PermissionId",
                principalSchema: "public",
                principalTable: "Permissions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Users_Roles_RoleId",
                schema: "public",
                table: "Users",
                column: "RoleId",
                principalSchema: "public",
                principalTable: "Roles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
