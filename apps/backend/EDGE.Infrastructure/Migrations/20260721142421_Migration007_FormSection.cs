using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EDGE.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Migration007_FormSection : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FormSection_Forms_FormId",
                schema: "public",
                table: "FormSection");

            migrationBuilder.DropForeignKey(
                name: "FK_SectionField_FormSection_FormSectionId",
                schema: "public",
                table: "SectionField");

            migrationBuilder.DropPrimaryKey(
                name: "PK_FormSection",
                schema: "public",
                table: "FormSection");

            migrationBuilder.DropIndex(
                name: "IX_FormSection_FormId",
                schema: "public",
                table: "FormSection");

            migrationBuilder.RenameTable(
                name: "FormSection",
                schema: "public",
                newName: "FormSections",
                newSchema: "public");

            migrationBuilder.AddPrimaryKey(
                name: "PK_FormSections",
                schema: "public",
                table: "FormSections",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_FormSections_FormId_Key",
                schema: "public",
                table: "FormSections",
                columns: new[] { "FormId", "Key" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_FormSections_Forms_FormId",
                schema: "public",
                table: "FormSections",
                column: "FormId",
                principalSchema: "public",
                principalTable: "Forms",
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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FormSections_Forms_FormId",
                schema: "public",
                table: "FormSections");

            migrationBuilder.DropForeignKey(
                name: "FK_SectionField_FormSections_FormSectionId",
                schema: "public",
                table: "SectionField");

            migrationBuilder.DropPrimaryKey(
                name: "PK_FormSections",
                schema: "public",
                table: "FormSections");

            migrationBuilder.DropIndex(
                name: "IX_FormSections_FormId_Key",
                schema: "public",
                table: "FormSections");

            migrationBuilder.RenameTable(
                name: "FormSections",
                schema: "public",
                newName: "FormSection",
                newSchema: "public");

            migrationBuilder.AddPrimaryKey(
                name: "PK_FormSection",
                schema: "public",
                table: "FormSection",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_FormSection_FormId",
                schema: "public",
                table: "FormSection",
                column: "FormId");

            migrationBuilder.AddForeignKey(
                name: "FK_FormSection_Forms_FormId",
                schema: "public",
                table: "FormSection",
                column: "FormId",
                principalSchema: "public",
                principalTable: "Forms",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_SectionField_FormSection_FormSectionId",
                schema: "public",
                table: "SectionField",
                column: "FormSectionId",
                principalSchema: "public",
                principalTable: "FormSection",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
