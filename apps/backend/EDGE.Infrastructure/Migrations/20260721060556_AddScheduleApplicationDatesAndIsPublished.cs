using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EDGE.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddScheduleApplicationDatesAndIsPublished : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "EndApplication",
                schema: "public",
                table: "Schedules",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsPublished",
                schema: "public",
                table: "Schedules",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "StartApplication",
                schema: "public",
                table: "Schedules",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Schedules_TenantId",
                schema: "public",
                table: "Schedules",
                column: "TenantId");

            migrationBuilder.AddForeignKey(
                name: "FK_Schedules_Tenants_TenantId",
                schema: "public",
                table: "Schedules",
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
                name: "FK_Schedules_Tenants_TenantId",
                schema: "public",
                table: "Schedules");

            migrationBuilder.DropIndex(
                name: "IX_Schedules_TenantId",
                schema: "public",
                table: "Schedules");

            migrationBuilder.DropColumn(
                name: "EndApplication",
                schema: "public",
                table: "Schedules");

            migrationBuilder.DropColumn(
                name: "IsPublished",
                schema: "public",
                table: "Schedules");

            migrationBuilder.DropColumn(
                name: "StartApplication",
                schema: "public",
                table: "Schedules");
        }
    }
}
