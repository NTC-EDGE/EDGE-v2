using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EDGE.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateNotesServiceFeeServiceVariantElement : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "ServiceCategoryId",
                schema: "public",
                table: "Notes",
                newName: "ServiceId");

            migrationBuilder.AddColumn<Guid>(
                name: "ServiceVariantElementId",
                schema: "public",
                table: "ServiceFees",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ServiceVariantId",
                schema: "public",
                table: "ServiceFees",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ServiceVariantId",
                schema: "public",
                table: "Notes",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ServiceVariantElements",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ServiceVariantId = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastModifiedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    IsDeletedBy = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServiceVariantElements", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ServiceVariantElements_ServiceVariants_ServiceVariantId",
                        column: x => x.ServiceVariantId,
                        principalSchema: "public",
                        principalTable: "ServiceVariants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ServiceFees_ServiceVariantElementId",
                schema: "public",
                table: "ServiceFees",
                column: "ServiceVariantElementId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceFees_ServiceVariantId",
                schema: "public",
                table: "ServiceFees",
                column: "ServiceVariantId");

            migrationBuilder.CreateIndex(
                name: "IX_Notes_ServiceId",
                schema: "public",
                table: "Notes",
                column: "ServiceId");

            migrationBuilder.CreateIndex(
                name: "IX_Notes_ServiceVariantId",
                schema: "public",
                table: "Notes",
                column: "ServiceVariantId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceVariantElements_ServiceVariantId",
                schema: "public",
                table: "ServiceVariantElements",
                column: "ServiceVariantId");

            // Purge any Notes rows whose ServiceId (formerly ServiceCategoryId) does not
            // reference a valid Services row. The column was renamed and existing data may
            // contain ServiceCategory GUIDs which are not valid Service IDs.
            migrationBuilder.Sql(
                @"DELETE FROM public.""Notes"" WHERE ""ServiceId"" NOT IN (SELECT ""Id"" FROM public.""Services"");");

            migrationBuilder.AddForeignKey(
                name: "FK_Notes_ServiceVariants_ServiceVariantId",
                schema: "public",
                table: "Notes",
                column: "ServiceVariantId",
                principalSchema: "public",
                principalTable: "ServiceVariants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Notes_Services_ServiceId",
                schema: "public",
                table: "Notes",
                column: "ServiceId",
                principalSchema: "public",
                principalTable: "Services",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ServiceFees_ServiceVariantElements_ServiceVariantElementId",
                schema: "public",
                table: "ServiceFees",
                column: "ServiceVariantElementId",
                principalSchema: "public",
                principalTable: "ServiceVariantElements",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ServiceFees_ServiceVariants_ServiceVariantId",
                schema: "public",
                table: "ServiceFees",
                column: "ServiceVariantId",
                principalSchema: "public",
                principalTable: "ServiceVariants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Notes_ServiceVariants_ServiceVariantId",
                schema: "public",
                table: "Notes");

            migrationBuilder.DropForeignKey(
                name: "FK_Notes_Services_ServiceId",
                schema: "public",
                table: "Notes");

            migrationBuilder.DropForeignKey(
                name: "FK_ServiceFees_ServiceVariantElements_ServiceVariantElementId",
                schema: "public",
                table: "ServiceFees");

            migrationBuilder.DropForeignKey(
                name: "FK_ServiceFees_ServiceVariants_ServiceVariantId",
                schema: "public",
                table: "ServiceFees");

            migrationBuilder.DropTable(
                name: "ServiceVariantElements",
                schema: "public");

            migrationBuilder.DropIndex(
                name: "IX_ServiceFees_ServiceVariantElementId",
                schema: "public",
                table: "ServiceFees");

            migrationBuilder.DropIndex(
                name: "IX_ServiceFees_ServiceVariantId",
                schema: "public",
                table: "ServiceFees");

            migrationBuilder.DropIndex(
                name: "IX_Notes_ServiceId",
                schema: "public",
                table: "Notes");

            migrationBuilder.DropIndex(
                name: "IX_Notes_ServiceVariantId",
                schema: "public",
                table: "Notes");

            migrationBuilder.DropColumn(
                name: "ServiceVariantElementId",
                schema: "public",
                table: "ServiceFees");

            migrationBuilder.DropColumn(
                name: "ServiceVariantId",
                schema: "public",
                table: "ServiceFees");

            migrationBuilder.DropColumn(
                name: "ServiceVariantId",
                schema: "public",
                table: "Notes");

            migrationBuilder.RenameColumn(
                name: "ServiceId",
                schema: "public",
                table: "Notes",
                newName: "ServiceCategoryId");
        }
    }
}
