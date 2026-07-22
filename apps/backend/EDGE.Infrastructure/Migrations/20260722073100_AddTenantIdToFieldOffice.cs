using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EDGE.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTenantIdToFieldOffice : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_FieldOffices_Code",
                schema: "public",
                table: "FieldOffices");

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "public",
                table: "FieldOffices",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_FieldOffices_TenantId_Code",
                schema: "public",
                table: "FieldOffices",
                columns: new[] { "TenantId", "Code" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_FieldOffices_Tenants_TenantId",
                schema: "public",
                table: "FieldOffices",
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
                name: "FK_FieldOffices_Tenants_TenantId",
                schema: "public",
                table: "FieldOffices");

            migrationBuilder.DropIndex(
                name: "IX_FieldOffices_TenantId_Code",
                schema: "public",
                table: "FieldOffices");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "public",
                table: "FieldOffices");

            migrationBuilder.CreateIndex(
                name: "IX_FieldOffices_Code",
                schema: "public",
                table: "FieldOffices",
                column: "Code",
                unique: true);
        }
    }
}
