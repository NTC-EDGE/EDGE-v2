using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EDGE.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddRequirementsCatalogAndStoredFileId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "StoredFileId",
                schema: "public",
                table: "ApplicationRequirements",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Requirements",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastModifiedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    IsDeletedBy = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Requirements", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ServiceVariantRequirements",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    RequirementId = table.Column<Guid>(type: "uuid", nullable: false),
                    ServiceVariantId = table.Column<Guid>(type: "uuid", nullable: false),
                    ApplicationTypeKey = table.Column<string>(type: "text", nullable: true),
                    IsRequired = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastModifiedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    IsDeletedBy = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServiceVariantRequirements", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ServiceVariantRequirements_Requirements_RequirementId",
                        column: x => x.RequirementId,
                        principalSchema: "public",
                        principalTable: "Requirements",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ServiceVariantRequirements_ServiceVariants_ServiceVariantId",
                        column: x => x.ServiceVariantId,
                        principalSchema: "public",
                        principalTable: "ServiceVariants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ApplicationRequirements_RequirementId",
                schema: "public",
                table: "ApplicationRequirements",
                column: "RequirementId");

            migrationBuilder.CreateIndex(
                name: "IX_ApplicationRequirements_ServiceVariantRequirementId",
                schema: "public",
                table: "ApplicationRequirements",
                column: "ServiceVariantRequirementId");

            migrationBuilder.CreateIndex(
                name: "IX_ApplicationRequirements_StoredFileId",
                schema: "public",
                table: "ApplicationRequirements",
                column: "StoredFileId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceVariantRequirements_RequirementId",
                schema: "public",
                table: "ServiceVariantRequirements",
                column: "RequirementId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceVariantRequirements_ServiceVariantId",
                schema: "public",
                table: "ServiceVariantRequirements",
                column: "ServiceVariantId");

            migrationBuilder.AddForeignKey(
                name: "FK_ApplicationRequirements_Requirements_RequirementId",
                schema: "public",
                table: "ApplicationRequirements",
                column: "RequirementId",
                principalSchema: "public",
                principalTable: "Requirements",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ApplicationRequirements_ServiceVariantRequirements_ServiceV~",
                schema: "public",
                table: "ApplicationRequirements",
                column: "ServiceVariantRequirementId",
                principalSchema: "public",
                principalTable: "ServiceVariantRequirements",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ApplicationRequirements_StoredFiles_StoredFileId",
                schema: "public",
                table: "ApplicationRequirements",
                column: "StoredFileId",
                principalSchema: "public",
                principalTable: "StoredFiles",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ApplicationRequirements_Requirements_RequirementId",
                schema: "public",
                table: "ApplicationRequirements");

            migrationBuilder.DropForeignKey(
                name: "FK_ApplicationRequirements_ServiceVariantRequirements_ServiceV~",
                schema: "public",
                table: "ApplicationRequirements");

            migrationBuilder.DropForeignKey(
                name: "FK_ApplicationRequirements_StoredFiles_StoredFileId",
                schema: "public",
                table: "ApplicationRequirements");

            migrationBuilder.DropTable(
                name: "ServiceVariantRequirements",
                schema: "public");

            migrationBuilder.DropTable(
                name: "Requirements",
                schema: "public");

            migrationBuilder.DropIndex(
                name: "IX_ApplicationRequirements_RequirementId",
                schema: "public",
                table: "ApplicationRequirements");

            migrationBuilder.DropIndex(
                name: "IX_ApplicationRequirements_ServiceVariantRequirementId",
                schema: "public",
                table: "ApplicationRequirements");

            migrationBuilder.DropIndex(
                name: "IX_ApplicationRequirements_StoredFileId",
                schema: "public",
                table: "ApplicationRequirements");

            migrationBuilder.DropColumn(
                name: "StoredFileId",
                schema: "public",
                table: "ApplicationRequirements");
        }
    }
}
