using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EDGE.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Migration011_CompanyDetail : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ApplicantDetails_CompanyDetail_CompanyDetailId",
                schema: "public",
                table: "ApplicantDetails");

            migrationBuilder.DropForeignKey(
                name: "FK_CompanyDetail_Barangays_BarangayId",
                schema: "public",
                table: "CompanyDetail");

            migrationBuilder.DropPrimaryKey(
                name: "PK_CompanyDetail",
                schema: "public",
                table: "CompanyDetail");

            migrationBuilder.RenameTable(
                name: "CompanyDetail",
                schema: "public",
                newName: "CompanyDetails",
                newSchema: "public");

            migrationBuilder.RenameIndex(
                name: "IX_CompanyDetail_BarangayId",
                schema: "public",
                table: "CompanyDetails",
                newName: "IX_CompanyDetails_BarangayId");

            migrationBuilder.AlterColumn<string>(
                name: "RegistrationNumber",
                schema: "public",
                table: "CompanyDetails",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                schema: "public",
                table: "CompanyDetails",
                type: "character varying(150)",
                maxLength: 150,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "EntityType",
                schema: "public",
                table: "CompanyDetails",
                type: "text",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_CompanyDetails",
                schema: "public",
                table: "CompanyDetails",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ApplicantDetails_CompanyDetails_CompanyDetailId",
                schema: "public",
                table: "ApplicantDetails",
                column: "CompanyDetailId",
                principalSchema: "public",
                principalTable: "CompanyDetails",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_CompanyDetails_Barangays_BarangayId",
                schema: "public",
                table: "CompanyDetails",
                column: "BarangayId",
                principalSchema: "public",
                principalTable: "Barangays",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ApplicantDetails_CompanyDetails_CompanyDetailId",
                schema: "public",
                table: "ApplicantDetails");

            migrationBuilder.DropForeignKey(
                name: "FK_CompanyDetails_Barangays_BarangayId",
                schema: "public",
                table: "CompanyDetails");

            migrationBuilder.DropPrimaryKey(
                name: "PK_CompanyDetails",
                schema: "public",
                table: "CompanyDetails");

            migrationBuilder.RenameTable(
                name: "CompanyDetails",
                schema: "public",
                newName: "CompanyDetail",
                newSchema: "public");

            migrationBuilder.RenameIndex(
                name: "IX_CompanyDetails_BarangayId",
                schema: "public",
                table: "CompanyDetail",
                newName: "IX_CompanyDetail_BarangayId");

            migrationBuilder.AlterColumn<string>(
                name: "RegistrationNumber",
                schema: "public",
                table: "CompanyDetail",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                schema: "public",
                table: "CompanyDetail",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(150)",
                oldMaxLength: 150);

            migrationBuilder.AlterColumn<int>(
                name: "EntityType",
                schema: "public",
                table: "CompanyDetail",
                type: "integer",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_CompanyDetail",
                schema: "public",
                table: "CompanyDetail",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ApplicantDetails_CompanyDetail_CompanyDetailId",
                schema: "public",
                table: "ApplicantDetails",
                column: "CompanyDetailId",
                principalSchema: "public",
                principalTable: "CompanyDetail",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_CompanyDetail_Barangays_BarangayId",
                schema: "public",
                table: "CompanyDetail",
                column: "BarangayId",
                principalSchema: "public",
                principalTable: "Barangays",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
