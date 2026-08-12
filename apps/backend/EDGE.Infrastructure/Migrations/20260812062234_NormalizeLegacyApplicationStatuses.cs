using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EDGE.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class NormalizeLegacyApplicationStatuses : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<Guid>(
                name: "PerformedByUserId",
                schema: "public",
                table: "SoaHistories",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AlterColumn<Guid>(
                name: "PerformedByUserId",
                schema: "public",
                table: "OpHistories",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AlterColumn<Guid>(
                name: "PerformedByUserId",
                schema: "public",
                table: "ApplicationHistories",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.Sql(@"UPDATE public.""Applications"" SET ""Status"" = 'Evaluating' WHERE ""Status"" IN ('ForApproval', 'Endorsed');");
            migrationBuilder.Sql(@"UPDATE public.""Applications"" SET ""Status"" = 'Approved' WHERE ""Status"" = 'ForVerification';");
            migrationBuilder.Sql(@"UPDATE public.""Applications"" SET ""Status"" = 'Returned' WHERE ""Status"" = 'Declined';");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<Guid>(
                name: "PerformedByUserId",
                schema: "public",
                table: "SoaHistories",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "PerformedByUserId",
                schema: "public",
                table: "OpHistories",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "PerformedByUserId",
                schema: "public",
                table: "ApplicationHistories",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);
        }
    }
}
