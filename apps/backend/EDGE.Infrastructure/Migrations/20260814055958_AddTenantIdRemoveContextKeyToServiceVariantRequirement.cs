using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EDGE.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTenantIdRemoveContextKeyToServiceVariantRequirement : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ContextKey",
                schema: "public",
                table: "ServiceVariantRequirements");

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "public",
                table: "ServiceVariantRequirements",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_ServiceVariantRequirements_TenantId",
                schema: "public",
                table: "ServiceVariantRequirements",
                column: "TenantId");

            migrationBuilder.AddForeignKey(
                name: "FK_ServiceVariantRequirements_Tenants_TenantId",
                schema: "public",
                table: "ServiceVariantRequirements",
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
                name: "FK_ServiceVariantRequirements_Tenants_TenantId",
                schema: "public",
                table: "ServiceVariantRequirements");

            migrationBuilder.DropIndex(
                name: "IX_ServiceVariantRequirements_TenantId",
                schema: "public",
                table: "ServiceVariantRequirements");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "public",
                table: "ServiceVariantRequirements");

            migrationBuilder.AddColumn<string>(
                name: "ContextKey",
                schema: "public",
                table: "ServiceVariantRequirements",
                type: "text",
                nullable: true);
        }
    }
}
