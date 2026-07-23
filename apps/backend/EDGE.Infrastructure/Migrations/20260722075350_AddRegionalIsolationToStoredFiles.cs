using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EDGE.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddRegionalIsolationToStoredFiles : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "RegionId",
                schema: "public",
                table: "StoredFiles",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_StoredFiles_RegionId",
                schema: "public",
                table: "StoredFiles",
                column: "RegionId");

            migrationBuilder.AddForeignKey(
                name: "FK_StoredFiles_Regions_RegionId",
                schema: "public",
                table: "StoredFiles",
                column: "RegionId",
                principalSchema: "public",
                principalTable: "Regions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_StoredFiles_Regions_RegionId",
                schema: "public",
                table: "StoredFiles");

            migrationBuilder.DropIndex(
                name: "IX_StoredFiles_RegionId",
                schema: "public",
                table: "StoredFiles");

            migrationBuilder.DropColumn(
                name: "RegionId",
                schema: "public",
                table: "StoredFiles");
        }
    }
}
