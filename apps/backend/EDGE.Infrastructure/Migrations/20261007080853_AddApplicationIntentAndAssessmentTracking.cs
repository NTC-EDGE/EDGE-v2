using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EDGE.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddApplicationIntentAndAssessmentTracking : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "AssessedAt",
                schema: "public",
                table: "Applications",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AssessmentRemarks",
                schema: "public",
                table: "Applications",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "AssessmentVersion",
                schema: "public",
                table: "Applications",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "ConvertedToRegularAt",
                schema: "public",
                table: "Applications",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Intent",
                schema: "public",
                table: "Applications",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AssessedAt",
                schema: "public",
                table: "Applications");

            migrationBuilder.DropColumn(
                name: "AssessmentRemarks",
                schema: "public",
                table: "Applications");

            migrationBuilder.DropColumn(
                name: "AssessmentVersion",
                schema: "public",
                table: "Applications");

            migrationBuilder.DropColumn(
                name: "ConvertedToRegularAt",
                schema: "public",
                table: "Applications");

            migrationBuilder.DropColumn(
                name: "Intent",
                schema: "public",
                table: "Applications");
        }
    }
}
