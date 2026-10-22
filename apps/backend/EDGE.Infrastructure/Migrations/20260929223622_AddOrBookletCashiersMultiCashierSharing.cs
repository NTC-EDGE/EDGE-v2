using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EDGE.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddOrBookletCashiersMultiCashierSharing : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "OrBookletCashiers",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    BookletId = table.Column<Guid>(type: "uuid", nullable: false),
                    CashierUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    IsPrimary = table.Column<bool>(type: "boolean", nullable: false),
                    AssignedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastModifiedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    IsDeletedBy = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrBookletCashiers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OrBookletCashiers_OrBooklets_BookletId",
                        column: x => x.BookletId,
                        principalSchema: "public",
                        principalTable: "OrBooklets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_OrBookletCashiers_Users_CashierUserId",
                        column: x => x.CashierUserId,
                        principalSchema: "public",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_OrBookletCashiers_BookletId_CashierUserId",
                schema: "public",
                table: "OrBookletCashiers",
                columns: new[] { "BookletId", "CashierUserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OrBookletCashiers_CashierUserId",
                schema: "public",
                table: "OrBookletCashiers",
                column: "CashierUserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "OrBookletCashiers",
                schema: "public");
        }
    }
}
