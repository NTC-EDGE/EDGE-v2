using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EDGE.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddApplicationRenewedFromRelation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "RenewedFromApplicationId",
                schema: "public",
                table: "Applications",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Applications_RenewedFromApplicationId",
                schema: "public",
                table: "Applications",
                column: "RenewedFromApplicationId");

            migrationBuilder.AddForeignKey(
                name: "FK_Applications_Applications_RenewedFromApplicationId",
                schema: "public",
                table: "Applications",
                column: "RenewedFromApplicationId",
                principalSchema: "public",
                principalTable: "Applications",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Applications_Applications_RenewedFromApplicationId",
                schema: "public",
                table: "Applications");

            migrationBuilder.DropIndex(
                name: "IX_Applications_RenewedFromApplicationId",
                schema: "public",
                table: "Applications");

            migrationBuilder.DropColumn(
                name: "RenewedFromApplicationId",
                schema: "public",
                table: "Applications");
        }
    }
}
