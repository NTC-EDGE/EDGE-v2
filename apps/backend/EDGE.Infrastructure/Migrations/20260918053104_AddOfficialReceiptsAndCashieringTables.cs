using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EDGE.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddOfficialReceiptsAndCashieringTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AgencyBankAccounts",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    BankName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    AccountName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    AccountNumber = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Branch = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    FundCluster = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    Remarks = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastModifiedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    IsDeletedBy = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AgencyBankAccounts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AgencyBankAccounts_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalSchema: "public",
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "OrBooklets",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    BookletNumber = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Prefix = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    StartNumber = table.Column<long>(type: "bigint", nullable: false),
                    EndNumber = table.Column<long>(type: "bigint", nullable: false),
                    CurrentNumber = table.Column<long>(type: "bigint", nullable: false),
                    TotalCount = table.Column<int>(type: "integer", nullable: false),
                    IssuedCount = table.Column<int>(type: "integer", nullable: false),
                    AssignedUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false),
                    ReceivedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Remarks = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastModifiedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    IsDeletedBy = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrBooklets", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OrBooklets_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalSchema: "public",
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_OrBooklets_Users_AssignedUserId",
                        column: x => x.AssignedUserId,
                        principalSchema: "public",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "BankDeposits",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    DepositSlipNumber = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    BankAccountId = table.Column<Guid>(type: "uuid", nullable: false),
                    DepositDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    TotalAmount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    CashAmount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    CheckAmount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    DepositedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    VerifiedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    DepositSlipAttachmentId = table.Column<Guid>(type: "uuid", nullable: true),
                    Remarks = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastModifiedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    IsDeletedBy = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BankDeposits", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BankDeposits_AgencyBankAccounts_BankAccountId",
                        column: x => x.BankAccountId,
                        principalSchema: "public",
                        principalTable: "AgencyBankAccounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_BankDeposits_StoredFiles_DepositSlipAttachmentId",
                        column: x => x.DepositSlipAttachmentId,
                        principalSchema: "public",
                        principalTable: "StoredFiles",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_BankDeposits_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalSchema: "public",
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_BankDeposits_Users_DepositedByUserId",
                        column: x => x.DepositedByUserId,
                        principalSchema: "public",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_BankDeposits_Users_VerifiedByUserId",
                        column: x => x.VerifiedByUserId,
                        principalSchema: "public",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "OfficialReceipts",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    OfficialReceiptNumber = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    BookletId = table.Column<Guid>(type: "uuid", nullable: true),
                    OrderOfPaymentId = table.Column<Guid>(type: "uuid", nullable: true),
                    ApplicationId = table.Column<Guid>(type: "uuid", nullable: true),
                    PayorName = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    PayorAddress = table.Column<string>(type: "text", nullable: true),
                    Amount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    PaymentMethod = table.Column<string>(type: "text", nullable: false),
                    CheckNumber = table.Column<string>(type: "text", nullable: true),
                    CheckBank = table.Column<string>(type: "text", nullable: true),
                    CheckDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DepositId = table.Column<Guid>(type: "uuid", nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false),
                    IssuedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IssuedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    CancelledAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CancelledByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    CancellationReason = table.Column<string>(type: "text", nullable: true),
                    Remarks = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastModifiedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    IsDeletedBy = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OfficialReceipts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OfficialReceipts_Applications_ApplicationId",
                        column: x => x.ApplicationId,
                        principalSchema: "public",
                        principalTable: "Applications",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_OfficialReceipts_BankDeposits_DepositId",
                        column: x => x.DepositId,
                        principalSchema: "public",
                        principalTable: "BankDeposits",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_OfficialReceipts_OrBooklets_BookletId",
                        column: x => x.BookletId,
                        principalSchema: "public",
                        principalTable: "OrBooklets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_OfficialReceipts_OrdersOfPayment_OrderOfPaymentId",
                        column: x => x.OrderOfPaymentId,
                        principalSchema: "public",
                        principalTable: "OrdersOfPayment",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_OfficialReceipts_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalSchema: "public",
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_OfficialReceipts_Users_CancelledByUserId",
                        column: x => x.CancelledByUserId,
                        principalSchema: "public",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_OfficialReceipts_Users_IssuedByUserId",
                        column: x => x.IssuedByUserId,
                        principalSchema: "public",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "OfficialReceiptLineItems",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    OfficialReceiptId = table.Column<Guid>(type: "uuid", nullable: false),
                    FeeCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Amount = table.Column<decimal>(type: "numeric(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OfficialReceiptLineItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OfficialReceiptLineItems_OfficialReceipts_OfficialReceiptId",
                        column: x => x.OfficialReceiptId,
                        principalSchema: "public",
                        principalTable: "OfficialReceipts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AgencyBankAccounts_TenantId_AccountNumber",
                schema: "public",
                table: "AgencyBankAccounts",
                columns: new[] { "TenantId", "AccountNumber" });

            migrationBuilder.CreateIndex(
                name: "IX_BankDeposits_BankAccountId",
                schema: "public",
                table: "BankDeposits",
                column: "BankAccountId");

            migrationBuilder.CreateIndex(
                name: "IX_BankDeposits_DepositedByUserId",
                schema: "public",
                table: "BankDeposits",
                column: "DepositedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_BankDeposits_DepositSlipAttachmentId",
                schema: "public",
                table: "BankDeposits",
                column: "DepositSlipAttachmentId");

            migrationBuilder.CreateIndex(
                name: "IX_BankDeposits_TenantId_DepositDate",
                schema: "public",
                table: "BankDeposits",
                columns: new[] { "TenantId", "DepositDate" });

            migrationBuilder.CreateIndex(
                name: "IX_BankDeposits_VerifiedByUserId",
                schema: "public",
                table: "BankDeposits",
                column: "VerifiedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_OfficialReceiptLineItems_OfficialReceiptId",
                schema: "public",
                table: "OfficialReceiptLineItems",
                column: "OfficialReceiptId");

            migrationBuilder.CreateIndex(
                name: "IX_OfficialReceipts_ApplicationId",
                schema: "public",
                table: "OfficialReceipts",
                column: "ApplicationId");

            migrationBuilder.CreateIndex(
                name: "IX_OfficialReceipts_BookletId",
                schema: "public",
                table: "OfficialReceipts",
                column: "BookletId");

            migrationBuilder.CreateIndex(
                name: "IX_OfficialReceipts_CancelledByUserId",
                schema: "public",
                table: "OfficialReceipts",
                column: "CancelledByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_OfficialReceipts_DepositId",
                schema: "public",
                table: "OfficialReceipts",
                column: "DepositId");

            migrationBuilder.CreateIndex(
                name: "IX_OfficialReceipts_IssuedByUserId",
                schema: "public",
                table: "OfficialReceipts",
                column: "IssuedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_OfficialReceipts_OrderOfPaymentId",
                schema: "public",
                table: "OfficialReceipts",
                column: "OrderOfPaymentId");

            migrationBuilder.CreateIndex(
                name: "IX_OfficialReceipts_TenantId_OfficialReceiptNumber",
                schema: "public",
                table: "OfficialReceipts",
                columns: new[] { "TenantId", "OfficialReceiptNumber" });

            migrationBuilder.CreateIndex(
                name: "IX_OfficialReceipts_TenantId_Status_IssuedAt",
                schema: "public",
                table: "OfficialReceipts",
                columns: new[] { "TenantId", "Status", "IssuedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_OrBooklets_AssignedUserId",
                schema: "public",
                table: "OrBooklets",
                column: "AssignedUserId");

            migrationBuilder.CreateIndex(
                name: "IX_OrBooklets_TenantId_BookletNumber",
                schema: "public",
                table: "OrBooklets",
                columns: new[] { "TenantId", "BookletNumber" });

            migrationBuilder.CreateIndex(
                name: "IX_OrBooklets_TenantId_Status",
                schema: "public",
                table: "OrBooklets",
                columns: new[] { "TenantId", "Status" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "OfficialReceiptLineItems",
                schema: "public");

            migrationBuilder.DropTable(
                name: "OfficialReceipts",
                schema: "public");

            migrationBuilder.DropTable(
                name: "BankDeposits",
                schema: "public");

            migrationBuilder.DropTable(
                name: "OrBooklets",
                schema: "public");

            migrationBuilder.DropTable(
                name: "AgencyBankAccounts",
                schema: "public");
        }
    }
}
