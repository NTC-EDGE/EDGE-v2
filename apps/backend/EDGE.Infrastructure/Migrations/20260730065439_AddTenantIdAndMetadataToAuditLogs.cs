using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EDGE.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTenantIdAndMetadataToAuditLogs : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Event",
                schema: "public",
                table: "AuditLogs",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "IpAddress",
                schema: "public",
                table: "AuditLogs",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Resource",
                schema: "public",
                table: "AuditLogs",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Status",
                schema: "public",
                table: "AuditLogs",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "public",
                table: "AuditLogs",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Type",
                schema: "public",
                table: "AuditLogs",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Event",
                schema: "public",
                table: "AuditLogs");

            migrationBuilder.DropColumn(
                name: "IpAddress",
                schema: "public",
                table: "AuditLogs");

            migrationBuilder.DropColumn(
                name: "Resource",
                schema: "public",
                table: "AuditLogs");

            migrationBuilder.DropColumn(
                name: "Status",
                schema: "public",
                table: "AuditLogs");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "public",
                table: "AuditLogs");

            migrationBuilder.DropColumn(
                name: "Type",
                schema: "public",
                table: "AuditLogs");
        }
    }
}
