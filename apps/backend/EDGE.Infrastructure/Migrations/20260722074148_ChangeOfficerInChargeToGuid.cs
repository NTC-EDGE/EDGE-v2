using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EDGE.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ChangeOfficerInChargeToGuid : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "OfficerInCharge",
                schema: "public",
                table: "FieldOffices");

            migrationBuilder.AddColumn<Guid>(
                name: "OfficerInChargeId",
                schema: "public",
                table: "FieldOffices",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_FieldOffices_OfficerInChargeId",
                schema: "public",
                table: "FieldOffices",
                column: "OfficerInChargeId");

            migrationBuilder.AddForeignKey(
                name: "FK_FieldOffices_TenantMembers_OfficerInChargeId",
                schema: "public",
                table: "FieldOffices",
                column: "OfficerInChargeId",
                principalSchema: "public",
                principalTable: "TenantMembers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FieldOffices_TenantMembers_OfficerInChargeId",
                schema: "public",
                table: "FieldOffices");

            migrationBuilder.DropIndex(
                name: "IX_FieldOffices_OfficerInChargeId",
                schema: "public",
                table: "FieldOffices");

            migrationBuilder.DropColumn(
                name: "OfficerInChargeId",
                schema: "public",
                table: "FieldOffices");

            migrationBuilder.AddColumn<string>(
                name: "OfficerInCharge",
                schema: "public",
                table: "FieldOffices",
                type: "text",
                nullable: false,
                defaultValue: "");
        }
    }
}
