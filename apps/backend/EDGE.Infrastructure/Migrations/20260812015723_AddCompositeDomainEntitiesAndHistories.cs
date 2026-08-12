using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EDGE.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCompositeDomainEntitiesAndHistories : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ApplicationHistories",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ApplicationId = table.Column<Guid>(type: "uuid", nullable: false),
                    Action = table.Column<string>(type: "text", nullable: false),
                    FromStatus = table.Column<int>(type: "integer", nullable: true),
                    ToStatus = table.Column<int>(type: "integer", nullable: false),
                    PerformedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    StaffName = table.Column<string>(type: "text", nullable: false),
                    StaffRole = table.Column<string>(type: "text", nullable: false),
                    Remarks = table.Column<string>(type: "text", nullable: true),
                    Timestamp = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ApplicationHistories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ApplicationHistories_Applications_ApplicationId",
                        column: x => x.ApplicationId,
                        principalSchema: "public",
                        principalTable: "Applications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CorrectionAuditTrails",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ApplicationId = table.Column<Guid>(type: "uuid", nullable: false),
                    Category = table.Column<string>(type: "text", nullable: false),
                    FieldName = table.Column<string>(type: "text", nullable: false),
                    OldValue = table.Column<string>(type: "text", nullable: false),
                    NewValue = table.Column<string>(type: "text", nullable: false),
                    CorrectedByStaff = table.Column<string>(type: "text", nullable: false),
                    CorrectedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CorrectionAuditTrails", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CorrectionAuditTrails_Applications_ApplicationId",
                        column: x => x.ApplicationId,
                        principalSchema: "public",
                        principalTable: "Applications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "StatementsOfAccount",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ApplicationId = table.Column<Guid>(type: "uuid", nullable: false),
                    ApplicantId = table.Column<Guid>(type: "uuid", nullable: true),
                    SoaNumber = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    IssuedToType = table.Column<string>(type: "text", nullable: false),
                    IssuedToName = table.Column<string>(type: "text", nullable: false),
                    IssuedToAddress = table.Column<string>(type: "text", nullable: true),
                    TotalAmount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    DueDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    PreparedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    ApprovedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    ApprovedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
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
                    table.PrimaryKey("PK_StatementsOfAccount", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StatementsOfAccount_Applicants_ApplicantId",
                        column: x => x.ApplicantId,
                        principalSchema: "public",
                        principalTable: "Applicants",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_StatementsOfAccount_Applications_ApplicationId",
                        column: x => x.ApplicationId,
                        principalSchema: "public",
                        principalTable: "Applications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "OrdersOfPayment",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ApplicationId = table.Column<Guid>(type: "uuid", nullable: false),
                    StatementOfAccountId = table.Column<Guid>(type: "uuid", nullable: false),
                    OpNumber = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    AmountDue = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    AmountReceived = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    PaymentMethod = table.Column<string>(type: "text", nullable: true),
                    OfficialReceiptNumber = table.Column<string>(type: "text", nullable: true),
                    CheckNumber = table.Column<string>(type: "text", nullable: true),
                    CheckName = table.Column<string>(type: "text", nullable: true),
                    CheckBank = table.Column<string>(type: "text", nullable: true),
                    CheckDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    VerifiedByCashierId = table.Column<Guid>(type: "uuid", nullable: true),
                    PaidAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
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
                    table.PrimaryKey("PK_OrdersOfPayment", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OrdersOfPayment_Applications_ApplicationId",
                        column: x => x.ApplicationId,
                        principalSchema: "public",
                        principalTable: "Applications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_OrdersOfPayment_StatementsOfAccount_StatementOfAccountId",
                        column: x => x.StatementOfAccountId,
                        principalSchema: "public",
                        principalTable: "StatementsOfAccount",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SoaHistories",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    StatementOfAccountId = table.Column<Guid>(type: "uuid", nullable: false),
                    Action = table.Column<string>(type: "text", nullable: false),
                    FromStatus = table.Column<int>(type: "integer", nullable: true),
                    ToStatus = table.Column<int>(type: "integer", nullable: false),
                    PerformedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    StaffName = table.Column<string>(type: "text", nullable: false),
                    StaffRole = table.Column<string>(type: "text", nullable: false),
                    Remarks = table.Column<string>(type: "text", nullable: true),
                    Timestamp = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SoaHistories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SoaHistories_StatementsOfAccount_StatementOfAccountId",
                        column: x => x.StatementOfAccountId,
                        principalSchema: "public",
                        principalTable: "StatementsOfAccount",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SoaLineItems",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    StatementOfAccountId = table.Column<Guid>(type: "uuid", nullable: false),
                    Particular = table.Column<string>(type: "text", nullable: false),
                    ItemCode = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    PeriodOfCoverageStart = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    PeriodOfCoverageEnd = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ValidityYears = table.Column<int>(type: "integer", nullable: false),
                    NoOfUnits = table.Column<int>(type: "integer", nullable: false),
                    FeeRate = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    Amount = table.Column<decimal>(type: "numeric(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SoaLineItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SoaLineItems_StatementsOfAccount_StatementOfAccountId",
                        column: x => x.StatementOfAccountId,
                        principalSchema: "public",
                        principalTable: "StatementsOfAccount",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "OpHistories",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    OrderOfPaymentId = table.Column<Guid>(type: "uuid", nullable: false),
                    Action = table.Column<string>(type: "text", nullable: false),
                    FromStatus = table.Column<int>(type: "integer", nullable: true),
                    ToStatus = table.Column<int>(type: "integer", nullable: false),
                    PerformedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    StaffName = table.Column<string>(type: "text", nullable: false),
                    StaffRole = table.Column<string>(type: "text", nullable: false),
                    OfficialReceiptNumber = table.Column<string>(type: "text", nullable: true),
                    Remarks = table.Column<string>(type: "text", nullable: true),
                    Timestamp = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OpHistories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OpHistories_OrdersOfPayment_OrderOfPaymentId",
                        column: x => x.OrderOfPaymentId,
                        principalSchema: "public",
                        principalTable: "OrdersOfPayment",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ApplicationHistories_ApplicationId",
                schema: "public",
                table: "ApplicationHistories",
                column: "ApplicationId");

            migrationBuilder.CreateIndex(
                name: "IX_CorrectionAuditTrails_ApplicationId",
                schema: "public",
                table: "CorrectionAuditTrails",
                column: "ApplicationId");

            migrationBuilder.CreateIndex(
                name: "IX_OpHistories_OrderOfPaymentId",
                schema: "public",
                table: "OpHistories",
                column: "OrderOfPaymentId");

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

            migrationBuilder.CreateIndex(
                name: "IX_SoaHistories_StatementOfAccountId",
                schema: "public",
                table: "SoaHistories",
                column: "StatementOfAccountId");

            migrationBuilder.CreateIndex(
                name: "IX_SoaLineItems_StatementOfAccountId",
                schema: "public",
                table: "SoaLineItems",
                column: "StatementOfAccountId");

            migrationBuilder.CreateIndex(
                name: "IX_StatementsOfAccount_ApplicantId",
                schema: "public",
                table: "StatementsOfAccount",
                column: "ApplicantId");

            migrationBuilder.CreateIndex(
                name: "IX_StatementsOfAccount_ApplicationId",
                schema: "public",
                table: "StatementsOfAccount",
                column: "ApplicationId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ApplicationHistories",
                schema: "public");

            migrationBuilder.DropTable(
                name: "CorrectionAuditTrails",
                schema: "public");

            migrationBuilder.DropTable(
                name: "OpHistories",
                schema: "public");

            migrationBuilder.DropTable(
                name: "SoaHistories",
                schema: "public");

            migrationBuilder.DropTable(
                name: "SoaLineItems",
                schema: "public");

            migrationBuilder.DropTable(
                name: "OrdersOfPayment",
                schema: "public");

            migrationBuilder.DropTable(
                name: "StatementsOfAccount",
                schema: "public");
        }
    }
}
