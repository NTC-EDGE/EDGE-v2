using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EDGE.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Migration012_Applicant : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Applicants",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: true),
                    IsGuest = table.Column<bool>(type: "boolean", nullable: false),
                    ApplicantType = table.Column<string>(type: "text", nullable: false),
                    ApplicantDetailId = table.Column<Guid>(type: "uuid", nullable: true),
                    CompanyDetailId = table.Column<Guid>(type: "uuid", nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastModifiedBy = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Applicants", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Applicants_ApplicantDetails_ApplicantDetailId",
                        column: x => x.ApplicantDetailId,
                        principalSchema: "public",
                        principalTable: "ApplicantDetails",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Applicants_CompanyDetails_CompanyDetailId",
                        column: x => x.CompanyDetailId,
                        principalSchema: "public",
                        principalTable: "CompanyDetails",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Applicants_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalSchema: "public",
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Applicants_Users_UserId",
                        column: x => x.UserId,
                        principalSchema: "public",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Applicants_ApplicantDetailId",
                schema: "public",
                table: "Applicants",
                column: "ApplicantDetailId");

            migrationBuilder.CreateIndex(
                name: "IX_Applicants_CompanyDetailId",
                schema: "public",
                table: "Applicants",
                column: "CompanyDetailId");

            migrationBuilder.CreateIndex(
                name: "IX_Applicants_TenantId",
                schema: "public",
                table: "Applicants",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Applicants_UserId",
                schema: "public",
                table: "Applicants",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Applicants",
                schema: "public");
        }
    }
}
