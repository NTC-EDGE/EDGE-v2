using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EDGE.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Migration009_SectionField : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SectionField_Fields_FieldId",
                schema: "public",
                table: "SectionField");

            migrationBuilder.DropForeignKey(
                name: "FK_SectionField_FormSections_FormSectionId",
                schema: "public",
                table: "SectionField");

            migrationBuilder.DropPrimaryKey(
                name: "PK_SectionField",
                schema: "public",
                table: "SectionField");

            migrationBuilder.DropIndex(
                name: "IX_SectionField_FormSectionId",
                schema: "public",
                table: "SectionField");

            migrationBuilder.RenameTable(
                name: "SectionField",
                schema: "public",
                newName: "SectionFields",
                newSchema: "public");

            migrationBuilder.RenameIndex(
                name: "IX_SectionField_FieldId",
                schema: "public",
                table: "SectionFields",
                newName: "IX_SectionFields_FieldId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_SectionFields",
                schema: "public",
                table: "SectionFields",
                columns: new[] { "FormSectionId", "FieldId" });

            migrationBuilder.AddForeignKey(
                name: "FK_SectionFields_Fields_FieldId",
                schema: "public",
                table: "SectionFields",
                column: "FieldId",
                principalSchema: "public",
                principalTable: "Fields",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_SectionFields_FormSections_FormSectionId",
                schema: "public",
                table: "SectionFields",
                column: "FormSectionId",
                principalSchema: "public",
                principalTable: "FormSections",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SectionFields_Fields_FieldId",
                schema: "public",
                table: "SectionFields");

            migrationBuilder.DropForeignKey(
                name: "FK_SectionFields_FormSections_FormSectionId",
                schema: "public",
                table: "SectionFields");

            migrationBuilder.DropPrimaryKey(
                name: "PK_SectionFields",
                schema: "public",
                table: "SectionFields");

            migrationBuilder.RenameTable(
                name: "SectionFields",
                schema: "public",
                newName: "SectionField",
                newSchema: "public");

            migrationBuilder.RenameIndex(
                name: "IX_SectionFields_FieldId",
                schema: "public",
                table: "SectionField",
                newName: "IX_SectionField_FieldId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_SectionField",
                schema: "public",
                table: "SectionField",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_SectionField_FormSectionId",
                schema: "public",
                table: "SectionField",
                column: "FormSectionId");

            migrationBuilder.AddForeignKey(
                name: "FK_SectionField_Fields_FieldId",
                schema: "public",
                table: "SectionField",
                column: "FieldId",
                principalSchema: "public",
                principalTable: "Fields",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_SectionField_FormSections_FormSectionId",
                schema: "public",
                table: "SectionField",
                column: "FormSectionId",
                principalSchema: "public",
                principalTable: "FormSections",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
