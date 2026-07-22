using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EDGE.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Migration008_Field : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SectionField_Field_FieldId",
                schema: "public",
                table: "SectionField");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Field",
                schema: "public",
                table: "Field");

            migrationBuilder.RenameTable(
                name: "Field",
                schema: "public",
                newName: "Fields",
                newSchema: "public");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Fields",
                schema: "public",
                table: "Fields",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_SectionField_Fields_FieldId",
                schema: "public",
                table: "SectionField",
                column: "FieldId",
                principalSchema: "public",
                principalTable: "Fields",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SectionField_Fields_FieldId",
                schema: "public",
                table: "SectionField");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Fields",
                schema: "public",
                table: "Fields");

            migrationBuilder.RenameTable(
                name: "Fields",
                schema: "public",
                newName: "Field",
                newSchema: "public");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Field",
                schema: "public",
                table: "Field",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_SectionField_Field_FieldId",
                schema: "public",
                table: "SectionField",
                column: "FieldId",
                principalSchema: "public",
                principalTable: "Field",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
