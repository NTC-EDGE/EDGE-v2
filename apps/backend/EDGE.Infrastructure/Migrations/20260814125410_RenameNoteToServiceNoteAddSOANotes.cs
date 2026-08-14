using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EDGE.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RenameNoteToServiceNoteAddSOANotes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Notes",
                schema: "public");

            migrationBuilder.AddColumn<Guid>(
                name: "SoaNoteId",
                schema: "public",
                table: "StatementsOfAccount",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ServiceNotes",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: false),
                    ServiceId = table.Column<Guid>(type: "uuid", nullable: false),
                    ServiceVariantId = table.Column<Guid>(type: "uuid", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastModifiedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    IsDeletedBy = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServiceNotes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ServiceNotes_ServiceVariants_ServiceVariantId",
                        column: x => x.ServiceVariantId,
                        principalSchema: "public",
                        principalTable: "ServiceVariants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ServiceNotes_Services_ServiceId",
                        column: x => x.ServiceId,
                        principalSchema: "public",
                        principalTable: "Services",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SoaNotes",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastModifiedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    IsDeletedBy = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SoaNotes", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_StatementsOfAccount_SoaNoteId",
                schema: "public",
                table: "StatementsOfAccount",
                column: "SoaNoteId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceNotes_ServiceId",
                schema: "public",
                table: "ServiceNotes",
                column: "ServiceId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceNotes_ServiceVariantId",
                schema: "public",
                table: "ServiceNotes",
                column: "ServiceVariantId");

            migrationBuilder.AddForeignKey(
                name: "FK_StatementsOfAccount_SoaNotes_SoaNoteId",
                schema: "public",
                table: "StatementsOfAccount",
                column: "SoaNoteId",
                principalSchema: "public",
                principalTable: "SoaNotes",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_StatementsOfAccount_SoaNotes_SoaNoteId",
                schema: "public",
                table: "StatementsOfAccount");

            migrationBuilder.DropTable(
                name: "ServiceNotes",
                schema: "public");

            migrationBuilder.DropTable(
                name: "SoaNotes",
                schema: "public");

            migrationBuilder.DropIndex(
                name: "IX_StatementsOfAccount_SoaNoteId",
                schema: "public",
                table: "StatementsOfAccount");

            migrationBuilder.DropColumn(
                name: "SoaNoteId",
                schema: "public",
                table: "StatementsOfAccount");

            migrationBuilder.CreateTable(
                name: "Notes",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ServiceId = table.Column<Guid>(type: "uuid", nullable: false),
                    ServiceVariantId = table.Column<Guid>(type: "uuid", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    IsDeletedBy = table.Column<string>(type: "text", nullable: false),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastModifiedBy = table.Column<string>(type: "text", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Notes_ServiceVariants_ServiceVariantId",
                        column: x => x.ServiceVariantId,
                        principalSchema: "public",
                        principalTable: "ServiceVariants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Notes_Services_ServiceId",
                        column: x => x.ServiceId,
                        principalSchema: "public",
                        principalTable: "Services",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

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
        }
    }
}
