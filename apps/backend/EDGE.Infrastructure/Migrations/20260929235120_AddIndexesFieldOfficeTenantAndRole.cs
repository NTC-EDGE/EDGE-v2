using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EDGE.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddIndexesFieldOfficeTenantAndRole : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Roles_TenantId",
                schema: "public",
                table: "Roles");

            migrationBuilder.CreateIndex(
                name: "IX_TenantMembers_TenantId_FieldOfficeId",
                schema: "public",
                table: "TenantMembers",
                columns: new[] { "TenantId", "FieldOfficeId" });

            migrationBuilder.CreateIndex(
                name: "IX_TenantMembers_TenantId_RoleId",
                schema: "public",
                table: "TenantMembers",
                columns: new[] { "TenantId", "RoleId" });

            migrationBuilder.CreateIndex(
                name: "IX_Roles_TenantId_Key",
                schema: "public",
                table: "Roles",
                columns: new[] { "TenantId", "Key" });

            migrationBuilder.CreateIndex(
                name: "IX_Roles_TenantId_Name",
                schema: "public",
                table: "Roles",
                columns: new[] { "TenantId", "Name" });

            migrationBuilder.CreateIndex(
                name: "IX_FieldOffices_TenantId_Name",
                schema: "public",
                table: "FieldOffices",
                columns: new[] { "TenantId", "Name" });

            migrationBuilder.CreateIndex(
                name: "IX_FieldOffices_TenantId_RegionId",
                schema: "public",
                table: "FieldOffices",
                columns: new[] { "TenantId", "RegionId" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_TenantMembers_TenantId_FieldOfficeId",
                schema: "public",
                table: "TenantMembers");

            migrationBuilder.DropIndex(
                name: "IX_TenantMembers_TenantId_RoleId",
                schema: "public",
                table: "TenantMembers");

            migrationBuilder.DropIndex(
                name: "IX_Roles_TenantId_Key",
                schema: "public",
                table: "Roles");

            migrationBuilder.DropIndex(
                name: "IX_Roles_TenantId_Name",
                schema: "public",
                table: "Roles");

            migrationBuilder.DropIndex(
                name: "IX_FieldOffices_TenantId_Name",
                schema: "public",
                table: "FieldOffices");

            migrationBuilder.DropIndex(
                name: "IX_FieldOffices_TenantId_RegionId",
                schema: "public",
                table: "FieldOffices");

            migrationBuilder.CreateIndex(
                name: "IX_Roles_TenantId",
                schema: "public",
                table: "Roles",
                column: "TenantId");
        }
    }
}
