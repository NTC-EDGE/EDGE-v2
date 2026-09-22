using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EDGE.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddReportAggregationIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_StatementsOfAccount_ApplicationId",
                schema: "public",
                table: "StatementsOfAccount");

            migrationBuilder.DropIndex(
                name: "IX_OrdersOfPayment_ApplicationId",
                schema: "public",
                table: "OrdersOfPayment");

            migrationBuilder.DropIndex(
                name: "IX_OrdersOfPayment_StatementOfAccountId",
                schema: "public",
                table: "OrdersOfPayment");

            migrationBuilder.CreateIndex(
                name: "IX_StatementsOfAccount_ApplicationId_CreatedAt",
                schema: "public",
                table: "StatementsOfAccount",
                columns: new[] { "ApplicationId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_OrdersOfPayment_ApplicationId_CreatedAt",
                schema: "public",
                table: "OrdersOfPayment",
                columns: new[] { "ApplicationId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_OrdersOfPayment_StatementOfAccountId_CreatedAt",
                schema: "public",
                table: "OrdersOfPayment",
                columns: new[] { "StatementOfAccountId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Feedbacks_CreatedAt",
                schema: "public",
                table: "Feedbacks",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Feedbacks_Status",
                schema: "public",
                table: "Feedbacks",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Applications_TenantId_CreatedAt",
                schema: "public",
                table: "Applications",
                columns: new[] { "TenantId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Applications_TenantId_Status",
                schema: "public",
                table: "Applications",
                columns: new[] { "TenantId", "Status" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_StatementsOfAccount_ApplicationId_CreatedAt",
                schema: "public",
                table: "StatementsOfAccount");

            migrationBuilder.DropIndex(
                name: "IX_OrdersOfPayment_ApplicationId_CreatedAt",
                schema: "public",
                table: "OrdersOfPayment");

            migrationBuilder.DropIndex(
                name: "IX_OrdersOfPayment_StatementOfAccountId_CreatedAt",
                schema: "public",
                table: "OrdersOfPayment");

            migrationBuilder.DropIndex(
                name: "IX_Feedbacks_CreatedAt",
                schema: "public",
                table: "Feedbacks");

            migrationBuilder.DropIndex(
                name: "IX_Feedbacks_Status",
                schema: "public",
                table: "Feedbacks");

            migrationBuilder.DropIndex(
                name: "IX_Applications_TenantId_CreatedAt",
                schema: "public",
                table: "Applications");

            migrationBuilder.DropIndex(
                name: "IX_Applications_TenantId_Status",
                schema: "public",
                table: "Applications");

            migrationBuilder.CreateIndex(
                name: "IX_StatementsOfAccount_ApplicationId",
                schema: "public",
                table: "StatementsOfAccount",
                column: "ApplicationId");

            migrationBuilder.CreateIndex(
                name: "IX_OrdersOfPayment_ApplicationId",
                schema: "public",
                table: "OrdersOfPayment",
                column: "ApplicationId");

            migrationBuilder.CreateIndex(
                name: "IX_OrdersOfPayment_StatementOfAccountId",
                schema: "public",
                table: "OrdersOfPayment",
                column: "StatementOfAccountId");
        }
    }
}
