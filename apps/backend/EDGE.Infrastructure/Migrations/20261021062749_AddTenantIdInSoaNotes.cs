using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EDGE.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTenantIdInSoaNotes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "public",
                table: "SoaNotes",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_SoaNotes_TenantId",
                schema: "public",
                table: "SoaNotes",
                column: "TenantId");

            migrationBuilder.AddForeignKey(
                name: "FK_SoaNotes_Tenants_TenantId",
                schema: "public",
                table: "SoaNotes",
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
                name: "FK_SoaNotes_Tenants_TenantId",
                schema: "public",
                table: "SoaNotes");

            migrationBuilder.DropIndex(
                name: "IX_SoaNotes_TenantId",
                schema: "public",
                table: "SoaNotes");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "public",
                table: "SoaNotes");
        }
    }
}
