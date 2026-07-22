using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EDGE.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Migration005_ExaminationSchedule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ExaminationSchedules",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ServiceId = table.Column<Guid>(type: "uuid", nullable: false),
                    ExamDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Venue = table.Column<string>(type: "text", nullable: false),
                    MaxSlots = table.Column<int>(type: "integer", nullable: false),
                    AvailableSlots = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastModifiedBy = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExaminationSchedules", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ExaminationSchedules_Services_ServiceId",
                        column: x => x.ServiceId,
                        principalSchema: "public",
                        principalTable: "Services",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ExaminationSchedules_ServiceId",
                schema: "public",
                table: "ExaminationSchedules",
                column: "ServiceId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ExaminationSchedules",
                schema: "public");
        }
    }
}
