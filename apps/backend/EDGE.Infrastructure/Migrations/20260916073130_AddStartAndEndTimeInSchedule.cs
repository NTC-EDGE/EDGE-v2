using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EDGE.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddStartAndEndTimeInSchedule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "EndTime",
                schema: "public",
                table: "Schedules",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "StartTime",
                schema: "public",
                table: "Schedules",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EndTime",
                schema: "public",
                table: "Schedules");

            migrationBuilder.DropColumn(
                name: "StartTime",
                schema: "public",
                table: "Schedules");
        }
    }
}
