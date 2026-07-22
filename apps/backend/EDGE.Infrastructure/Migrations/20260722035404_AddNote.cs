using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EDGE.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddNote : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "JoinedAt",
                schema: "public",
                table: "TenantMembers");

            migrationBuilder.RenameColumn(
                name: "Slug",
                schema: "public",
                table: "Tenants",
                newName: "Code");

            migrationBuilder.RenameIndex(
                name: "IX_Tenants_Slug",
                schema: "public",
                table: "Tenants",
                newName: "IX_Tenants_Code");

            migrationBuilder.RenameColumn(
                name: "IsActive",
                schema: "public",
                table: "TenantMembers",
                newName: "IsDeleted");

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                schema: "public",
                table: "Users",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "IsDeletedBy",
                schema: "public",
                table: "Users",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                schema: "public",
                table: "Tenants",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                schema: "public",
                table: "Tenants",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "IsDeletedBy",
                schema: "public",
                table: "Tenants",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<Guid>(
                name: "RegionId",
                schema: "public",
                table: "Tenants",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<string>(
                name: "Designation",
                schema: "public",
                table: "TenantMembers",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Division",
                schema: "public",
                table: "TenantMembers",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<Guid>(
                name: "FieldOfficeId",
                schema: "public",
                table: "TenantMembers",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "IsDeletedBy",
                schema: "public",
                table: "TenantMembers",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "JobTitle",
                schema: "public",
                table: "TenantMembers",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Level",
                schema: "public",
                table: "TenantMembers",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Position",
                schema: "public",
                table: "TenantMembers",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                schema: "public",
                table: "Schedules",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "IsDeletedBy",
                schema: "public",
                table: "Schedules",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                schema: "public",
                table: "Roles",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "IsDeletedBy",
                schema: "public",
                table: "Roles",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                schema: "public",
                table: "RolePermissions",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "IsDeletedBy",
                schema: "public",
                table: "RolePermissions",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                schema: "public",
                table: "Applications",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "IsDeletedBy",
                schema: "public",
                table: "Applications",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "FieldOffices",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    RegionId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProvinceId = table.Column<Guid>(type: "uuid", nullable: true),
                    Address = table.Column<string>(type: "text", nullable: false),
                    ContactPhone = table.Column<string>(type: "text", nullable: false),
                    ContactEmail = table.Column<string>(type: "text", nullable: false),
                    OfficerInCharge = table.Column<string>(type: "text", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    AllowSpectrumInspection = table.Column<bool>(type: "boolean", nullable: false),
                    AllowPermitIssuance = table.Column<bool>(type: "boolean", nullable: false),
                    AllowComplaintReception = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastModifiedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    IsDeletedBy = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FieldOffices", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FieldOffices_Provinces_ProvinceId",
                        column: x => x.ProvinceId,
                        principalSchema: "public",
                        principalTable: "Provinces",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_FieldOffices_Regions_RegionId",
                        column: x => x.RegionId,
                        principalSchema: "public",
                        principalTable: "Regions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Notes",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: false),
                    ServiceCategoryId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastModifiedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    IsDeletedBy = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notes", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Tenants_RegionId",
                schema: "public",
                table: "Tenants",
                column: "RegionId");

            migrationBuilder.CreateIndex(
                name: "IX_TenantMembers_FieldOfficeId",
                schema: "public",
                table: "TenantMembers",
                column: "FieldOfficeId");

            migrationBuilder.CreateIndex(
                name: "IX_FieldOffices_Code",
                schema: "public",
                table: "FieldOffices",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_FieldOffices_ProvinceId",
                schema: "public",
                table: "FieldOffices",
                column: "ProvinceId");

            migrationBuilder.CreateIndex(
                name: "IX_FieldOffices_RegionId",
                schema: "public",
                table: "FieldOffices",
                column: "RegionId");

            migrationBuilder.AddForeignKey(
                name: "FK_TenantMembers_FieldOffices_FieldOfficeId",
                schema: "public",
                table: "TenantMembers",
                column: "FieldOfficeId",
                principalSchema: "public",
                principalTable: "FieldOffices",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.Sql(@"
                INSERT INTO public.""Regions"" (""Id"", ""Code"", ""Name"", ""IsActive"")
                VALUES ('1e66819d-583c-4852-83bd-a4195bd126a8', 'NCR', 'National Capital Region', true)
                ON CONFLICT (""Id"") DO NOTHING;
            ");

            migrationBuilder.Sql(@"
                INSERT INTO public.""Regions"" (""Id"", ""Code"", ""Name"", ""IsActive"")
                VALUES ('00000000-0000-0000-0000-000000000000', 'DEFAULT', 'Default Region', true)
                ON CONFLICT (""Id"") DO NOTHING;
            ");

            migrationBuilder.AddForeignKey(
                name: "FK_Tenants_Regions_RegionId",
                schema: "public",
                table: "Tenants",
                column: "RegionId",
                principalSchema: "public",
                principalTable: "Regions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TenantMembers_FieldOffices_FieldOfficeId",
                schema: "public",
                table: "TenantMembers");

            migrationBuilder.DropForeignKey(
                name: "FK_Tenants_Regions_RegionId",
                schema: "public",
                table: "Tenants");

            migrationBuilder.DropTable(
                name: "FieldOffices",
                schema: "public");

            migrationBuilder.DropTable(
                name: "Notes",
                schema: "public");

            migrationBuilder.DropIndex(
                name: "IX_Tenants_RegionId",
                schema: "public",
                table: "Tenants");

            migrationBuilder.DropIndex(
                name: "IX_TenantMembers_FieldOfficeId",
                schema: "public",
                table: "TenantMembers");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                schema: "public",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "IsDeletedBy",
                schema: "public",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                schema: "public",
                table: "Tenants");

            migrationBuilder.DropColumn(
                name: "IsDeletedBy",
                schema: "public",
                table: "Tenants");

            migrationBuilder.DropColumn(
                name: "RegionId",
                schema: "public",
                table: "Tenants");

            migrationBuilder.DropColumn(
                name: "Designation",
                schema: "public",
                table: "TenantMembers");

            migrationBuilder.DropColumn(
                name: "Division",
                schema: "public",
                table: "TenantMembers");

            migrationBuilder.DropColumn(
                name: "FieldOfficeId",
                schema: "public",
                table: "TenantMembers");

            migrationBuilder.DropColumn(
                name: "IsDeletedBy",
                schema: "public",
                table: "TenantMembers");

            migrationBuilder.DropColumn(
                name: "JobTitle",
                schema: "public",
                table: "TenantMembers");

            migrationBuilder.DropColumn(
                name: "Level",
                schema: "public",
                table: "TenantMembers");

            migrationBuilder.DropColumn(
                name: "Position",
                schema: "public",
                table: "TenantMembers");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                schema: "public",
                table: "Schedules");

            migrationBuilder.DropColumn(
                name: "IsDeletedBy",
                schema: "public",
                table: "Schedules");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                schema: "public",
                table: "Roles");

            migrationBuilder.DropColumn(
                name: "IsDeletedBy",
                schema: "public",
                table: "Roles");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                schema: "public",
                table: "RolePermissions");

            migrationBuilder.DropColumn(
                name: "IsDeletedBy",
                schema: "public",
                table: "RolePermissions");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                schema: "public",
                table: "Applications");

            migrationBuilder.DropColumn(
                name: "IsDeletedBy",
                schema: "public",
                table: "Applications");

            migrationBuilder.RenameColumn(
                name: "Code",
                schema: "public",
                table: "Tenants",
                newName: "Slug");

            migrationBuilder.RenameIndex(
                name: "IX_Tenants_Code",
                schema: "public",
                table: "Tenants",
                newName: "IX_Tenants_Slug");

            migrationBuilder.RenameColumn(
                name: "IsDeleted",
                schema: "public",
                table: "TenantMembers",
                newName: "IsActive");

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                schema: "public",
                table: "Tenants",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(500)",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "JoinedAt",
                schema: "public",
                table: "TenantMembers",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));
        }
    }
}
