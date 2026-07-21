using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace EDGE.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddUserExpandedProperties : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PasswordHash",
                schema: "public",
                table: "Users");

            migrationBuilder.RenameColumn(
                name: "Role",
                schema: "public",
                table: "Users",
                newName: "AuthUserId");

            migrationBuilder.AddColumn<Guid>(
                name: "BarangayId",
                schema: "public",
                table: "Users",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ContactNumber",
                schema: "public",
                table: "Users",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CourseTaken",
                schema: "public",
                table: "Users",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DateOfBirth",
                schema: "public",
                table: "Users",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ESignature",
                schema: "public",
                table: "Users",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<float>(
                name: "Height",
                schema: "public",
                table: "Users",
                type: "real",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsOnline",
                schema: "public",
                table: "Users",
                type: "boolean",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastOnline",
                schema: "public",
                table: "Users",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MiddleName",
                schema: "public",
                table: "Users",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Nationality",
                schema: "public",
                table: "Users",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ProfilePicture",
                schema: "public",
                table: "Users",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "RoleId",
                schema: "public",
                table: "Users",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<string>(
                name: "SchoolAttended",
                schema: "public",
                table: "Users",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Sex",
                schema: "public",
                table: "Users",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Street",
                schema: "public",
                table: "Users",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Suffix",
                schema: "public",
                table: "Users",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Unit",
                schema: "public",
                table: "Users",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<float>(
                name: "Weight",
                schema: "public",
                table: "Users",
                type: "real",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ZipCode",
                schema: "public",
                table: "Users",
                type: "text",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Permissions",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Key = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastModifiedBy = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Permissions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Roles",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Key = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastModifiedBy = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Roles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "RolePermissions",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PermissionId = table.Column<Guid>(type: "uuid", nullable: false),
                    RoleId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastModifiedBy = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RolePermissions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RolePermissions_Permissions_PermissionId",
                        column: x => x.PermissionId,
                        principalSchema: "public",
                        principalTable: "Permissions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RolePermissions_Roles_RoleId",
                        column: x => x.RoleId,
                        principalSchema: "public",
                        principalTable: "Roles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
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

            migrationBuilder.UpdateData(
                schema: "public",
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "AuthUserId", "BarangayId", "ContactNumber", "CourseTaken", "DateOfBirth", "ESignature", "Height", "IsOnline", "LastOnline", "MiddleName", "Nationality", "ProfilePicture", "RoleId", "SchoolAttended", "Sex", "Street", "Suffix", "Unit", "Weight", "ZipCode" },
                values: new object[] { "user_client123", null, null, null, null, null, null, null, null, null, null, null, new Guid("10000000-0000-0000-0000-000000000001"), null, null, null, null, null, null, null });

            migrationBuilder.UpdateData(
                schema: "public",
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                columns: new[] { "AuthUserId", "BarangayId", "ContactNumber", "CourseTaken", "DateOfBirth", "ESignature", "Height", "IsOnline", "LastOnline", "MiddleName", "Nationality", "ProfilePicture", "RoleId", "SchoolAttended", "Sex", "Street", "Suffix", "Unit", "Weight", "ZipCode" },
                values: new object[] { "user_evaluator123", null, null, null, null, null, null, null, null, null, null, null, new Guid("10000000-0000-0000-0000-000000000002"), null, null, null, null, null, null, null });

            migrationBuilder.UpdateData(
                schema: "public",
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                columns: new[] { "AuthUserId", "BarangayId", "ContactNumber", "CourseTaken", "DateOfBirth", "ESignature", "Height", "IsOnline", "LastOnline", "MiddleName", "Nationality", "ProfilePicture", "RoleId", "SchoolAttended", "Sex", "Street", "Suffix", "Unit", "Weight", "ZipCode" },
                values: new object[] { "user_higherups123", null, null, null, null, null, null, null, null, null, null, null, new Guid("10000000-0000-0000-0000-000000000003"), null, null, null, null, null, null, null });

            migrationBuilder.UpdateData(
                schema: "public",
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("44444444-4444-4444-4444-444444444444"),
                columns: new[] { "AuthUserId", "BarangayId", "ContactNumber", "CourseTaken", "DateOfBirth", "ESignature", "Height", "IsOnline", "LastOnline", "MiddleName", "Nationality", "ProfilePicture", "RoleId", "SchoolAttended", "Sex", "Street", "Suffix", "Unit", "Weight", "ZipCode" },
                values: new object[] { "user_accountant123", null, null, null, null, null, null, null, null, null, null, null, new Guid("10000000-0000-0000-0000-000000000004"), null, null, null, null, null, null, null });

            migrationBuilder.UpdateData(
                schema: "public",
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("55555555-5555-5555-5555-555555555555"),
                columns: new[] { "AuthUserId", "BarangayId", "ContactNumber", "CourseTaken", "DateOfBirth", "ESignature", "Height", "IsOnline", "LastOnline", "MiddleName", "Nationality", "ProfilePicture", "RoleId", "SchoolAttended", "Sex", "Street", "Suffix", "Unit", "Weight", "ZipCode" },
                values: new object[] { "user_cashier123", null, null, null, null, null, null, null, null, null, null, null, new Guid("10000000-0000-0000-0000-000000000005"), null, null, null, null, null, null, null });

            migrationBuilder.UpdateData(
                schema: "public",
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("66666666-6666-6666-6666-666666666666"),
                columns: new[] { "AuthUserId", "BarangayId", "ContactNumber", "CourseTaken", "DateOfBirth", "ESignature", "Height", "IsOnline", "LastOnline", "MiddleName", "Nationality", "ProfilePicture", "RoleId", "SchoolAttended", "Sex", "Street", "Suffix", "Unit", "Weight", "ZipCode" },
                values: new object[] { "user_admin123", null, null, null, null, null, null, null, null, null, null, null, new Guid("10000000-0000-0000-0000-000000000006"), null, null, null, null, null, null, null });

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
                name: "FK_Users_Roles_RoleId",
                schema: "public",
                table: "Users",
                column: "RoleId",
                principalSchema: "public",
                principalTable: "Roles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Users_Roles_RoleId",
                schema: "public",
                table: "Users");

            migrationBuilder.DropTable(
                name: "RolePermissions",
                schema: "public");

            migrationBuilder.DropTable(
                name: "Permissions",
                schema: "public");

            migrationBuilder.DropTable(
                name: "Roles",
                schema: "public");

            migrationBuilder.DropIndex(
                name: "IX_Users_RoleId",
                schema: "public",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "BarangayId",
                schema: "public",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "ContactNumber",
                schema: "public",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "CourseTaken",
                schema: "public",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "DateOfBirth",
                schema: "public",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "ESignature",
                schema: "public",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "Height",
                schema: "public",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "IsOnline",
                schema: "public",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "LastOnline",
                schema: "public",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "MiddleName",
                schema: "public",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "Nationality",
                schema: "public",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "ProfilePicture",
                schema: "public",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "RoleId",
                schema: "public",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "SchoolAttended",
                schema: "public",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "Sex",
                schema: "public",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "Street",
                schema: "public",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "Suffix",
                schema: "public",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "Unit",
                schema: "public",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "Weight",
                schema: "public",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "ZipCode",
                schema: "public",
                table: "Users");

            migrationBuilder.RenameColumn(
                name: "AuthUserId",
                schema: "public",
                table: "Users",
                newName: "Role");

            migrationBuilder.AddColumn<string>(
                name: "PasswordHash",
                schema: "public",
                table: "Users",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.UpdateData(
                schema: "public",
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "PasswordHash", "Role" },
                values: new object[] { "$2a$11$H/esh9ssCwL4iJaOPJWSa.aLLbSUZCZRcIS0WVReGuQeD/LyPvXRu", "Client" });

            migrationBuilder.UpdateData(
                schema: "public",
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                columns: new[] { "PasswordHash", "Role" },
                values: new object[] { "$2a$11$H/esh9ssCwL4iJaOPJWSa.aLLbSUZCZRcIS0WVReGuQeD/LyPvXRu", "Evaluator" });

            migrationBuilder.UpdateData(
                schema: "public",
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                columns: new[] { "PasswordHash", "Role" },
                values: new object[] { "$2a$11$H/esh9ssCwL4iJaOPJWSa.aLLbSUZCZRcIS0WVReGuQeD/LyPvXRu", "HigherUps" });

            migrationBuilder.UpdateData(
                schema: "public",
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("44444444-4444-4444-4444-444444444444"),
                columns: new[] { "PasswordHash", "Role" },
                values: new object[] { "$2a$11$H/esh9ssCwL4iJaOPJWSa.aLLbSUZCZRcIS0WVReGuQeD/LyPvXRu", "Accountant" });

            migrationBuilder.UpdateData(
                schema: "public",
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("55555555-5555-5555-5555-555555555555"),
                columns: new[] { "PasswordHash", "Role" },
                values: new object[] { "$2a$11$H/esh9ssCwL4iJaOPJWSa.aLLbSUZCZRcIS0WVReGuQeD/LyPvXRu", "Cashier" });

            migrationBuilder.UpdateData(
                schema: "public",
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("66666666-6666-6666-6666-666666666666"),
                columns: new[] { "PasswordHash", "Role" },
                values: new object[] { "$2a$11$H/esh9ssCwL4iJaOPJWSa.aLLbSUZCZRcIS0WVReGuQeD/LyPvXRu", "Admin" });
        }
    }
}
