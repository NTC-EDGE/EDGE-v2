using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EDGE.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemoveSeatNumberAndApplicationIdFromSchedule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ApplicationId",
                schema: "public",
                table: "Schedules");

            migrationBuilder.DropColumn(
                name: "SeatNumber",
                schema: "public",
                table: "Schedules");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "ApplicationId",
                schema: "public",
                table: "Schedules",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SeatNumber",
                schema: "public",
                table: "Schedules",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);
        }
    }
}
