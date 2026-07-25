using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EDGE.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RenameApplicationTypeKeyToContextKey : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "ApplicationTypeKey",
                schema: "public",
                table: "ServiceVariantRequirements",
                newName: "ContextKey");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "ContextKey",
                schema: "public",
                table: "ServiceVariantRequirements",
                newName: "ApplicationTypeKey");
        }
    }
}
