using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EDGE.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Migration016_FormSubmission : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "FormSubmissions",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ApplicationId = table.Column<Guid>(type: "uuid", nullable: false),
                    FormId = table.Column<Guid>(type: "uuid", nullable: false),
                    ApplicantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastModifiedBy = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FormSubmissions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FormSubmissions_Applicants_ApplicantId",
                        column: x => x.ApplicantId,
                        principalSchema: "public",
                        principalTable: "Applicants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_FormSubmissions_Applications_ApplicationId",
                        column: x => x.ApplicationId,
                        principalSchema: "public",
                        principalTable: "Applications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_FormSubmissions_Forms_FormId",
                        column: x => x.FormId,
                        principalSchema: "public",
                        principalTable: "Forms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "FormFieldValue",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FormSubmissionId = table.Column<Guid>(type: "uuid", nullable: false),
                    FieldId = table.Column<Guid>(type: "uuid", nullable: false),
                    Value = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FormFieldValue", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FormFieldValue_Fields_FieldId",
                        column: x => x.FieldId,
                        principalSchema: "public",
                        principalTable: "Fields",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_FormFieldValue_FormSubmissions_FormSubmissionId",
                        column: x => x.FormSubmissionId,
                        principalSchema: "public",
                        principalTable: "FormSubmissions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_FormFieldValue_FieldId",
                schema: "public",
                table: "FormFieldValue",
                column: "FieldId");

            migrationBuilder.CreateIndex(
                name: "IX_FormFieldValue_FormSubmissionId",
                schema: "public",
                table: "FormFieldValue",
                column: "FormSubmissionId");

            migrationBuilder.CreateIndex(
                name: "IX_FormSubmissions_ApplicantId",
                schema: "public",
                table: "FormSubmissions",
                column: "ApplicantId");

            migrationBuilder.CreateIndex(
                name: "IX_FormSubmissions_ApplicationId",
                schema: "public",
                table: "FormSubmissions",
                column: "ApplicationId");

            migrationBuilder.CreateIndex(
                name: "IX_FormSubmissions_FormId",
                schema: "public",
                table: "FormSubmissions",
                column: "FormId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "FormFieldValue",
                schema: "public");

            migrationBuilder.DropTable(
                name: "FormSubmissions",
                schema: "public");
        }
    }
}
