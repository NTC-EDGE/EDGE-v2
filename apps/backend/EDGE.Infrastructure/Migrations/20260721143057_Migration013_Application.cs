using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EDGE.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Migration013_Application : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Applications",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    ScheduleId = table.Column<Guid>(type: "uuid", nullable: true),
                    RegionId = table.Column<Guid>(type: "uuid", nullable: true),
                    Office = table.Column<string>(type: "text", nullable: true),
                    ApplicationNumber = table.Column<string>(type: "text", nullable: true),
                    ReferenceNumber = table.Column<string>(type: "text", nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false),
                    SubmissionMode = table.Column<string>(type: "text", nullable: false),
                    DataEntryMethod = table.Column<string>(type: "text", nullable: true),
                    Remarks = table.Column<string>(type: "text", nullable: true),
                    UserId = table.Column<Guid>(type: "uuid", nullable: true),
                    IsGuest = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastModifiedBy = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Applications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Applications_Regions_RegionId",
                        column: x => x.RegionId,
                        principalSchema: "public",
                        principalTable: "Regions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Applications_Schedules_ScheduleId",
                        column: x => x.ScheduleId,
                        principalSchema: "public",
                        principalTable: "Schedules",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Applications_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalSchema: "public",
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Applications_Users_UserId",
                        column: x => x.UserId,
                        principalSchema: "public",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ApplicationApplicant",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ApplicationId = table.Column<Guid>(type: "uuid", nullable: false),
                    ApplicantId = table.Column<Guid>(type: "uuid", nullable: false),
                    SequenceOrder = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ApplicationApplicant", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ApplicationApplicant_Applicants_ApplicantId",
                        column: x => x.ApplicantId,
                        principalSchema: "public",
                        principalTable: "Applicants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ApplicationApplicant_Applications_ApplicationId",
                        column: x => x.ApplicationId,
                        principalSchema: "public",
                        principalTable: "Applications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ApplicationRequirement",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ApplicationId = table.Column<Guid>(type: "uuid", nullable: false),
                    ApplicantId = table.Column<Guid>(type: "uuid", nullable: false),
                    RequirementId = table.Column<Guid>(type: "uuid", nullable: false),
                    ServiceVariantRequirementId = table.Column<Guid>(type: "uuid", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    Url = table.Column<string>(type: "text", nullable: false),
                    IsApproved = table.Column<bool>(type: "boolean", nullable: false),
                    ApprovedBy = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastModifiedBy = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ApplicationRequirement", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ApplicationRequirement_Applicants_ApplicantId",
                        column: x => x.ApplicantId,
                        principalSchema: "public",
                        principalTable: "Applicants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ApplicationRequirement_Applications_ApplicationId",
                        column: x => x.ApplicationId,
                        principalSchema: "public",
                        principalTable: "Applications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ApplicationRequirement_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalSchema: "public",
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ApplicationService",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ApplicationId = table.Column<Guid>(type: "uuid", nullable: false),
                    ServiceCategoryId = table.Column<Guid>(type: "uuid", nullable: true),
                    ServiceId = table.Column<Guid>(type: "uuid", nullable: true),
                    ServiceVariantId = table.Column<Guid>(type: "uuid", nullable: true),
                    ApplicationTypeKey = table.Column<string>(type: "text", nullable: true),
                    DynamicDataJson = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ApplicationService", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ApplicationService_Applications_ApplicationId",
                        column: x => x.ApplicationId,
                        principalSchema: "public",
                        principalTable: "Applications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ApplicationService_ServiceCategories_ServiceCategoryId",
                        column: x => x.ServiceCategoryId,
                        principalSchema: "public",
                        principalTable: "ServiceCategories",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ApplicationService_ServiceVariants_ServiceVariantId",
                        column: x => x.ServiceVariantId,
                        principalSchema: "public",
                        principalTable: "ServiceVariants",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ApplicationService_Services_ServiceId",
                        column: x => x.ServiceId,
                        principalSchema: "public",
                        principalTable: "Services",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_ApplicationApplicant_ApplicantId",
                schema: "public",
                table: "ApplicationApplicant",
                column: "ApplicantId");

            migrationBuilder.CreateIndex(
                name: "IX_ApplicationApplicant_ApplicationId",
                schema: "public",
                table: "ApplicationApplicant",
                column: "ApplicationId");

            migrationBuilder.CreateIndex(
                name: "IX_ApplicationRequirement_ApplicantId",
                schema: "public",
                table: "ApplicationRequirement",
                column: "ApplicantId");

            migrationBuilder.CreateIndex(
                name: "IX_ApplicationRequirement_ApplicationId",
                schema: "public",
                table: "ApplicationRequirement",
                column: "ApplicationId");

            migrationBuilder.CreateIndex(
                name: "IX_ApplicationRequirement_TenantId",
                schema: "public",
                table: "ApplicationRequirement",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Applications_RegionId",
                schema: "public",
                table: "Applications",
                column: "RegionId");

            migrationBuilder.CreateIndex(
                name: "IX_Applications_ScheduleId",
                schema: "public",
                table: "Applications",
                column: "ScheduleId");

            migrationBuilder.CreateIndex(
                name: "IX_Applications_TenantId",
                schema: "public",
                table: "Applications",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Applications_UserId",
                schema: "public",
                table: "Applications",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_ApplicationService_ApplicationId",
                schema: "public",
                table: "ApplicationService",
                column: "ApplicationId");

            migrationBuilder.CreateIndex(
                name: "IX_ApplicationService_ServiceCategoryId",
                schema: "public",
                table: "ApplicationService",
                column: "ServiceCategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_ApplicationService_ServiceId",
                schema: "public",
                table: "ApplicationService",
                column: "ServiceId");

            migrationBuilder.CreateIndex(
                name: "IX_ApplicationService_ServiceVariantId",
                schema: "public",
                table: "ApplicationService",
                column: "ServiceVariantId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ApplicationApplicant",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ApplicationRequirement",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ApplicationService",
                schema: "public");

            migrationBuilder.DropTable(
                name: "Applications",
                schema: "public");
        }
    }
}
