using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EDGE.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class IssuedDocumentDetail : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "IssuedDocumentDetails",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ApplicationId = table.Column<Guid>(type: "uuid", nullable: false),
                    ApplicantId = table.Column<Guid>(type: "uuid", nullable: true),
                    DocumentType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    FormNumber = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    LicenseNumber = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    CallSign = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    StationClass = table.Column<string>(type: "text", nullable: true),
                    FrequencyBand = table.Column<string>(type: "text", nullable: true),
                    IssueDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ExpiryDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    OriginalEvaluatorUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    OriginalEvaluatorName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    IssuedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    IssuedByStaffName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    IsAlternateIssuer = table.Column<bool>(type: "boolean", nullable: false),
                    OfficialReceiptNumber = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    QrVerificationCode = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    DocumentFileUrl = table.Column<string>(type: "text", nullable: true),
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
                    table.PrimaryKey("PK_IssuedDocumentDetails", x => x.Id);
                    table.ForeignKey(
                        name: "FK_IssuedDocumentDetails_Applicants_ApplicantId",
                        column: x => x.ApplicantId,
                        principalSchema: "public",
                        principalTable: "Applicants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_IssuedDocumentDetails_Applications_ApplicationId",
                        column: x => x.ApplicationId,
                        principalSchema: "public",
                        principalTable: "Applications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_IssuedDocumentDetails_ApplicantId",
                schema: "public",
                table: "IssuedDocumentDetails",
                column: "ApplicantId");

            migrationBuilder.CreateIndex(
                name: "IX_IssuedDocumentDetails_ApplicationId",
                schema: "public",
                table: "IssuedDocumentDetails",
                column: "ApplicationId");

            migrationBuilder.CreateIndex(
                name: "IX_IssuedDocumentDetails_CallSign",
                schema: "public",
                table: "IssuedDocumentDetails",
                column: "CallSign");

            migrationBuilder.CreateIndex(
                name: "IX_IssuedDocumentDetails_FormNumber",
                schema: "public",
                table: "IssuedDocumentDetails",
                column: "FormNumber");

            migrationBuilder.CreateIndex(
                name: "IX_IssuedDocumentDetails_LicenseNumber",
                schema: "public",
                table: "IssuedDocumentDetails",
                column: "LicenseNumber");

            migrationBuilder.CreateIndex(
                name: "IX_IssuedDocumentDetails_OfficialReceiptNumber",
                schema: "public",
                table: "IssuedDocumentDetails",
                column: "OfficialReceiptNumber");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "IssuedDocumentDetails",
                schema: "public");
        }
    }
}
