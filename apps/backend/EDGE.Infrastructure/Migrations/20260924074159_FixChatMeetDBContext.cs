using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EDGE.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixChatMeetDBContext : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MeetingParticipants_Tenants_TenantId",
                schema: "public",
                table: "MeetingParticipants");

            migrationBuilder.DropForeignKey(
                name: "FK_Meetings_Tenants_TenantId",
                schema: "public",
                table: "Meetings");

            migrationBuilder.DropForeignKey(
                name: "FK_Meetings_Users_HostUserId",
                schema: "public",
                table: "Meetings");

            migrationBuilder.DropForeignKey(
                name: "FK_UserNotifications_Tenants_TenantId",
                schema: "public",
                table: "UserNotifications");

            migrationBuilder.DropIndex(
                name: "IX_Meetings_HostUserId",
                schema: "public",
                table: "Meetings");

            migrationBuilder.DropIndex(
                name: "IX_MeetingPollVotes_MeetingPollId",
                schema: "public",
                table: "MeetingPollVotes");

            migrationBuilder.DropIndex(
                name: "IX_MeetingParticipants_UserId",
                schema: "public",
                table: "MeetingParticipants");

            migrationBuilder.DropIndex(
                name: "IX_ConversationParticipants_UserId",
                schema: "public",
                table: "ConversationParticipants");

            migrationBuilder.AlterColumn<string>(
                name: "ReferenceId",
                schema: "public",
                table: "UserNotifications",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserNotifications_UserId",
                schema: "public",
                table: "UserNotifications",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserNotifications_UserId_CreatedAt",
                schema: "public",
                table: "UserNotifications",
                columns: new[] { "UserId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_UserNotifications_UserId_IsRead_CreatedAt",
                schema: "public",
                table: "UserNotifications",
                columns: new[] { "UserId", "IsRead", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Meetings_HostUserId_ScheduledStartTime_IsDeleted",
                schema: "public",
                table: "Meetings",
                columns: new[] { "HostUserId", "ScheduledStartTime", "IsDeleted" });

            migrationBuilder.CreateIndex(
                name: "IX_MeetingPollVotes_MeetingPollId_UserId",
                schema: "public",
                table: "MeetingPollVotes",
                columns: new[] { "MeetingPollId", "UserId" });

            migrationBuilder.CreateIndex(
                name: "IX_MeetingParticipants_MeetingId_IsHandRaised",
                schema: "public",
                table: "MeetingParticipants",
                columns: new[] { "MeetingId", "IsHandRaised" });

            migrationBuilder.CreateIndex(
                name: "IX_MeetingParticipants_UserId_MeetingId_IsDeleted",
                schema: "public",
                table: "MeetingParticipants",
                columns: new[] { "UserId", "MeetingId", "IsDeleted" });

            migrationBuilder.CreateIndex(
                name: "IX_ConversationParticipants_LastReadAt",
                schema: "public",
                table: "ConversationParticipants",
                column: "LastReadAt");

            migrationBuilder.CreateIndex(
                name: "IX_ConversationParticipants_UserId_HasLeft_IsDeleted",
                schema: "public",
                table: "ConversationParticipants",
                columns: new[] { "UserId", "HasLeft", "IsDeleted" });

            migrationBuilder.AddForeignKey(
                name: "FK_MeetingParticipants_Tenants_TenantId",
                schema: "public",
                table: "MeetingParticipants",
                column: "TenantId",
                principalSchema: "public",
                principalTable: "Tenants",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Meetings_Tenants_TenantId",
                schema: "public",
                table: "Meetings",
                column: "TenantId",
                principalSchema: "public",
                principalTable: "Tenants",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Meetings_Users_HostUserId",
                schema: "public",
                table: "Meetings",
                column: "HostUserId",
                principalSchema: "public",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_UserNotifications_Tenants_TenantId",
                schema: "public",
                table: "UserNotifications",
                column: "TenantId",
                principalSchema: "public",
                principalTable: "Tenants",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MeetingParticipants_Tenants_TenantId",
                schema: "public",
                table: "MeetingParticipants");

            migrationBuilder.DropForeignKey(
                name: "FK_Meetings_Tenants_TenantId",
                schema: "public",
                table: "Meetings");

            migrationBuilder.DropForeignKey(
                name: "FK_Meetings_Users_HostUserId",
                schema: "public",
                table: "Meetings");

            migrationBuilder.DropForeignKey(
                name: "FK_UserNotifications_Tenants_TenantId",
                schema: "public",
                table: "UserNotifications");

            migrationBuilder.DropIndex(
                name: "IX_UserNotifications_UserId",
                schema: "public",
                table: "UserNotifications");

            migrationBuilder.DropIndex(
                name: "IX_UserNotifications_UserId_CreatedAt",
                schema: "public",
                table: "UserNotifications");

            migrationBuilder.DropIndex(
                name: "IX_UserNotifications_UserId_IsRead_CreatedAt",
                schema: "public",
                table: "UserNotifications");

            migrationBuilder.DropIndex(
                name: "IX_Meetings_HostUserId_ScheduledStartTime_IsDeleted",
                schema: "public",
                table: "Meetings");

            migrationBuilder.DropIndex(
                name: "IX_MeetingPollVotes_MeetingPollId_UserId",
                schema: "public",
                table: "MeetingPollVotes");

            migrationBuilder.DropIndex(
                name: "IX_MeetingParticipants_MeetingId_IsHandRaised",
                schema: "public",
                table: "MeetingParticipants");

            migrationBuilder.DropIndex(
                name: "IX_MeetingParticipants_UserId_MeetingId_IsDeleted",
                schema: "public",
                table: "MeetingParticipants");

            migrationBuilder.DropIndex(
                name: "IX_ConversationParticipants_LastReadAt",
                schema: "public",
                table: "ConversationParticipants");

            migrationBuilder.DropIndex(
                name: "IX_ConversationParticipants_UserId_HasLeft_IsDeleted",
                schema: "public",
                table: "ConversationParticipants");

            migrationBuilder.AlterColumn<string>(
                name: "ReferenceId",
                schema: "public",
                table: "UserNotifications",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Meetings_HostUserId",
                schema: "public",
                table: "Meetings",
                column: "HostUserId");

            migrationBuilder.CreateIndex(
                name: "IX_MeetingPollVotes_MeetingPollId",
                schema: "public",
                table: "MeetingPollVotes",
                column: "MeetingPollId");

            migrationBuilder.CreateIndex(
                name: "IX_MeetingParticipants_UserId",
                schema: "public",
                table: "MeetingParticipants",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_ConversationParticipants_UserId",
                schema: "public",
                table: "ConversationParticipants",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_MeetingParticipants_Tenants_TenantId",
                schema: "public",
                table: "MeetingParticipants",
                column: "TenantId",
                principalSchema: "public",
                principalTable: "Tenants",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Meetings_Tenants_TenantId",
                schema: "public",
                table: "Meetings",
                column: "TenantId",
                principalSchema: "public",
                principalTable: "Tenants",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Meetings_Users_HostUserId",
                schema: "public",
                table: "Meetings",
                column: "HostUserId",
                principalSchema: "public",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_UserNotifications_Tenants_TenantId",
                schema: "public",
                table: "UserNotifications",
                column: "TenantId",
                principalSchema: "public",
                principalTable: "Tenants",
                principalColumn: "Id");
        }
    }
}
