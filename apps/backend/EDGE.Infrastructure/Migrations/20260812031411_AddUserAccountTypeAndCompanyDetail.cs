using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EDGE.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddUserAccountTypeAndCompanyDetail : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AccountType",
                schema: "public",
                table: "Users",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<Guid>(
                name: "CompanyDetailId",
                schema: "public",
                table: "Users",
                type: "uuid",
                nullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "BarangayId",
                schema: "public",
                table: "CompanyDetails",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.CreateIndex(
                name: "IX_Users_CompanyDetailId",
                schema: "public",
                table: "Users",
                column: "CompanyDetailId");

            migrationBuilder.AddForeignKey(
                name: "FK_Users_CompanyDetails_CompanyDetailId",
                schema: "public",
                table: "Users",
                column: "CompanyDetailId",
                principalSchema: "public",
                principalTable: "CompanyDetails",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Users_CompanyDetails_CompanyDetailId",
                schema: "public",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Users_CompanyDetailId",
                schema: "public",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "AccountType",
                schema: "public",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "CompanyDetailId",
                schema: "public",
                table: "Users");

            migrationBuilder.AlterColumn<Guid>(
                name: "BarangayId",
                schema: "public",
                table: "CompanyDetails",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);
        }
    }
}
