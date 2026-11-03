using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EDGE.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSoaNotesAndStatementOfAccountIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_SoaNotes_Code",
                schema: "public",
                table: "SoaNotes",
                column: "Code");

            migrationBuilder.CreateIndex(
                name: "IX_SoaNotes_TenantId_Code",
                schema: "public",
                table: "SoaNotes",
                columns: new[] { "TenantId", "Code" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_SoaNotes_Code",
                schema: "public",
                table: "SoaNotes");

            migrationBuilder.DropIndex(
                name: "IX_SoaNotes_TenantId_Code",
                schema: "public",
                table: "SoaNotes");
        }
    }
}
