using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EDGE.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class CreateIndexReferenceNumberAndStatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Applications_ReferenceNumber",
                schema: "public",
                table: "Applications",
                column: "ReferenceNumber");

            migrationBuilder.CreateIndex(
                name: "IX_Applications_Status",
                schema: "public",
                table: "Applications",
                column: "Status");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Applications_ReferenceNumber",
                schema: "public",
                table: "Applications");

            migrationBuilder.DropIndex(
                name: "IX_Applications_Status",
                schema: "public",
                table: "Applications");
        }
    }
}
