using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EDGE.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Migration015_ApplicationApplicant : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ApplicationApplicant_Applicants_ApplicantId",
                schema: "public",
                table: "ApplicationApplicant");

            migrationBuilder.DropForeignKey(
                name: "FK_ApplicationApplicant_Applications_ApplicationId",
                schema: "public",
                table: "ApplicationApplicant");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ApplicationApplicant",
                schema: "public",
                table: "ApplicationApplicant");

            migrationBuilder.DropIndex(
                name: "IX_ApplicationApplicant_ApplicationId",
                schema: "public",
                table: "ApplicationApplicant");

            migrationBuilder.RenameTable(
                name: "ApplicationApplicant",
                schema: "public",
                newName: "ApplicationApplicants",
                newSchema: "public");

            migrationBuilder.RenameIndex(
                name: "IX_ApplicationApplicant_ApplicantId",
                schema: "public",
                table: "ApplicationApplicants",
                newName: "IX_ApplicationApplicants_ApplicantId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ApplicationApplicants",
                schema: "public",
                table: "ApplicationApplicants",
                columns: new[] { "ApplicationId", "ApplicantId" });

            migrationBuilder.AddForeignKey(
                name: "FK_ApplicationApplicants_Applicants_ApplicantId",
                schema: "public",
                table: "ApplicationApplicants",
                column: "ApplicantId",
                principalSchema: "public",
                principalTable: "Applicants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ApplicationApplicants_Applications_ApplicationId",
                schema: "public",
                table: "ApplicationApplicants",
                column: "ApplicationId",
                principalSchema: "public",
                principalTable: "Applications",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ApplicationApplicants_Applicants_ApplicantId",
                schema: "public",
                table: "ApplicationApplicants");

            migrationBuilder.DropForeignKey(
                name: "FK_ApplicationApplicants_Applications_ApplicationId",
                schema: "public",
                table: "ApplicationApplicants");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ApplicationApplicants",
                schema: "public",
                table: "ApplicationApplicants");

            migrationBuilder.RenameTable(
                name: "ApplicationApplicants",
                schema: "public",
                newName: "ApplicationApplicant",
                newSchema: "public");

            migrationBuilder.RenameIndex(
                name: "IX_ApplicationApplicants_ApplicantId",
                schema: "public",
                table: "ApplicationApplicant",
                newName: "IX_ApplicationApplicant_ApplicantId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ApplicationApplicant",
                schema: "public",
                table: "ApplicationApplicant",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_ApplicationApplicant_ApplicationId",
                schema: "public",
                table: "ApplicationApplicant",
                column: "ApplicationId");

            migrationBuilder.AddForeignKey(
                name: "FK_ApplicationApplicant_Applicants_ApplicantId",
                schema: "public",
                table: "ApplicationApplicant",
                column: "ApplicantId",
                principalSchema: "public",
                principalTable: "Applicants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ApplicationApplicant_Applications_ApplicationId",
                schema: "public",
                table: "ApplicationApplicant",
                column: "ApplicationId",
                principalSchema: "public",
                principalTable: "Applications",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
