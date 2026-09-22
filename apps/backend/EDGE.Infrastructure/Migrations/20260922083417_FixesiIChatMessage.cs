using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EDGE.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixesiIChatMessage : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ChatMessages_Tenants_SenderTenantId",
                schema: "public",
                table: "ChatMessages");

            migrationBuilder.DropForeignKey(
                name: "FK_ConversationParticipants_Tenants_TenantId",
                schema: "public",
                table: "ConversationParticipants");

            migrationBuilder.DropForeignKey(
                name: "FK_MeetingParticipants_Tenants_TenantId",
                schema: "public",
                table: "MeetingParticipants");

            migrationBuilder.AlterColumn<Guid>(
                name: "TenantId",
                schema: "public",
                table: "MeetingParticipants",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AlterColumn<Guid>(
                name: "TenantId",
                schema: "public",
                table: "ConversationParticipants",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AlterColumn<Guid>(
                name: "SenderTenantId",
                schema: "public",
                table: "ChatMessages",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AddForeignKey(
                name: "FK_ChatMessages_Tenants_SenderTenantId",
                schema: "public",
                table: "ChatMessages",
                column: "SenderTenantId",
                principalSchema: "public",
                principalTable: "Tenants",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ConversationParticipants_Tenants_TenantId",
                schema: "public",
                table: "ConversationParticipants",
                column: "TenantId",
                principalSchema: "public",
                principalTable: "Tenants",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_MeetingParticipants_Tenants_TenantId",
                schema: "public",
                table: "MeetingParticipants",
                column: "TenantId",
                principalSchema: "public",
                principalTable: "Tenants",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ChatMessages_Tenants_SenderTenantId",
                schema: "public",
                table: "ChatMessages");

            migrationBuilder.DropForeignKey(
                name: "FK_ConversationParticipants_Tenants_TenantId",
                schema: "public",
                table: "ConversationParticipants");

            migrationBuilder.DropForeignKey(
                name: "FK_MeetingParticipants_Tenants_TenantId",
                schema: "public",
                table: "MeetingParticipants");

            migrationBuilder.AlterColumn<Guid>(
                name: "TenantId",
                schema: "public",
                table: "MeetingParticipants",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "TenantId",
                schema: "public",
                table: "ConversationParticipants",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "SenderTenantId",
                schema: "public",
                table: "ChatMessages",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_ChatMessages_Tenants_SenderTenantId",
                schema: "public",
                table: "ChatMessages",
                column: "SenderTenantId",
                principalSchema: "public",
                principalTable: "Tenants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ConversationParticipants_Tenants_TenantId",
                schema: "public",
                table: "ConversationParticipants",
                column: "TenantId",
                principalSchema: "public",
                principalTable: "Tenants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_MeetingParticipants_Tenants_TenantId",
                schema: "public",
                table: "MeetingParticipants",
                column: "TenantId",
                principalSchema: "public",
                principalTable: "Tenants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
