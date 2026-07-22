using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EDGE.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Migration018_ApplicationRequirement : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ApplicationRequirement_Applicants_ApplicantId",
                schema: "public",
                table: "ApplicationRequirement");

            migrationBuilder.DropForeignKey(
                name: "FK_ApplicationRequirement_Applications_ApplicationId",
                schema: "public",
                table: "ApplicationRequirement");

            migrationBuilder.DropForeignKey(
                name: "FK_ApplicationRequirement_Tenants_TenantId",
                schema: "public",
                table: "ApplicationRequirement");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ApplicationRequirement",
                schema: "public",
                table: "ApplicationRequirement");

            migrationBuilder.RenameTable(
                name: "ApplicationRequirement",
                schema: "public",
                newName: "ApplicationRequirements",
                newSchema: "public");

            migrationBuilder.RenameIndex(
                name: "IX_ApplicationRequirement_TenantId",
                schema: "public",
                table: "ApplicationRequirements",
                newName: "IX_ApplicationRequirements_TenantId");

            migrationBuilder.RenameIndex(
                name: "IX_ApplicationRequirement_ApplicationId",
                schema: "public",
                table: "ApplicationRequirements",
                newName: "IX_ApplicationRequirements_ApplicationId");

            migrationBuilder.RenameIndex(
                name: "IX_ApplicationRequirement_ApplicantId",
                schema: "public",
                table: "ApplicationRequirements",
                newName: "IX_ApplicationRequirements_ApplicantId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ApplicationRequirements",
                schema: "public",
                table: "ApplicationRequirements",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ApplicationRequirements_Applicants_ApplicantId",
                schema: "public",
                table: "ApplicationRequirements",
                column: "ApplicantId",
                principalSchema: "public",
                principalTable: "Applicants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ApplicationRequirements_Applications_ApplicationId",
                schema: "public",
                table: "ApplicationRequirements",
                column: "ApplicationId",
                principalSchema: "public",
                principalTable: "Applications",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ApplicationRequirements_Tenants_TenantId",
                schema: "public",
                table: "ApplicationRequirements",
                column: "TenantId",
                principalSchema: "public",
                principalTable: "Tenants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ApplicationRequirements_Applicants_ApplicantId",
                schema: "public",
                table: "ApplicationRequirements");

            migrationBuilder.DropForeignKey(
                name: "FK_ApplicationRequirements_Applications_ApplicationId",
                schema: "public",
                table: "ApplicationRequirements");

            migrationBuilder.DropForeignKey(
                name: "FK_ApplicationRequirements_Tenants_TenantId",
                schema: "public",
                table: "ApplicationRequirements");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ApplicationRequirements",
                schema: "public",
                table: "ApplicationRequirements");

            migrationBuilder.RenameTable(
                name: "ApplicationRequirements",
                schema: "public",
                newName: "ApplicationRequirement",
                newSchema: "public");

            migrationBuilder.RenameIndex(
                name: "IX_ApplicationRequirements_TenantId",
                schema: "public",
                table: "ApplicationRequirement",
                newName: "IX_ApplicationRequirement_TenantId");

            migrationBuilder.RenameIndex(
                name: "IX_ApplicationRequirements_ApplicationId",
                schema: "public",
                table: "ApplicationRequirement",
                newName: "IX_ApplicationRequirement_ApplicationId");

            migrationBuilder.RenameIndex(
                name: "IX_ApplicationRequirements_ApplicantId",
                schema: "public",
                table: "ApplicationRequirement",
                newName: "IX_ApplicationRequirement_ApplicantId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ApplicationRequirement",
                schema: "public",
                table: "ApplicationRequirement",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ApplicationRequirement_Applicants_ApplicantId",
                schema: "public",
                table: "ApplicationRequirement",
                column: "ApplicantId",
                principalSchema: "public",
                principalTable: "Applicants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ApplicationRequirement_Applications_ApplicationId",
                schema: "public",
                table: "ApplicationRequirement",
                column: "ApplicationId",
                principalSchema: "public",
                principalTable: "Applications",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ApplicationRequirement_Tenants_TenantId",
                schema: "public",
                table: "ApplicationRequirement",
                column: "TenantId",
                principalSchema: "public",
                principalTable: "Tenants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
