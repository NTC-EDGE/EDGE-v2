using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EDGE.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Migration017_FormFieldValue : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FormFieldValue_Fields_FieldId",
                schema: "public",
                table: "FormFieldValue");

            migrationBuilder.DropForeignKey(
                name: "FK_FormFieldValue_FormSubmissions_FormSubmissionId",
                schema: "public",
                table: "FormFieldValue");

            migrationBuilder.DropPrimaryKey(
                name: "PK_FormFieldValue",
                schema: "public",
                table: "FormFieldValue");

            migrationBuilder.DropIndex(
                name: "IX_FormFieldValue_FormSubmissionId",
                schema: "public",
                table: "FormFieldValue");

            migrationBuilder.RenameTable(
                name: "FormFieldValue",
                schema: "public",
                newName: "FormFieldValues",
                newSchema: "public");

            migrationBuilder.RenameIndex(
                name: "IX_FormFieldValue_FieldId",
                schema: "public",
                table: "FormFieldValues",
                newName: "IX_FormFieldValues_FieldId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_FormFieldValues",
                schema: "public",
                table: "FormFieldValues",
                columns: new[] { "FormSubmissionId", "FieldId" });

            migrationBuilder.AddForeignKey(
                name: "FK_FormFieldValues_Fields_FieldId",
                schema: "public",
                table: "FormFieldValues",
                column: "FieldId",
                principalSchema: "public",
                principalTable: "Fields",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_FormFieldValues_FormSubmissions_FormSubmissionId",
                schema: "public",
                table: "FormFieldValues",
                column: "FormSubmissionId",
                principalSchema: "public",
                principalTable: "FormSubmissions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FormFieldValues_Fields_FieldId",
                schema: "public",
                table: "FormFieldValues");

            migrationBuilder.DropForeignKey(
                name: "FK_FormFieldValues_FormSubmissions_FormSubmissionId",
                schema: "public",
                table: "FormFieldValues");

            migrationBuilder.DropPrimaryKey(
                name: "PK_FormFieldValues",
                schema: "public",
                table: "FormFieldValues");

            migrationBuilder.RenameTable(
                name: "FormFieldValues",
                schema: "public",
                newName: "FormFieldValue",
                newSchema: "public");

            migrationBuilder.RenameIndex(
                name: "IX_FormFieldValues_FieldId",
                schema: "public",
                table: "FormFieldValue",
                newName: "IX_FormFieldValue_FieldId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_FormFieldValue",
                schema: "public",
                table: "FormFieldValue",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_FormFieldValue_FormSubmissionId",
                schema: "public",
                table: "FormFieldValue",
                column: "FormSubmissionId");

            migrationBuilder.AddForeignKey(
                name: "FK_FormFieldValue_Fields_FieldId",
                schema: "public",
                table: "FormFieldValue",
                column: "FieldId",
                principalSchema: "public",
                principalTable: "Fields",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_FormFieldValue_FormSubmissions_FormSubmissionId",
                schema: "public",
                table: "FormFieldValue",
                column: "FormSubmissionId",
                principalSchema: "public",
                principalTable: "FormSubmissions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
