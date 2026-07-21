using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EDGE.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Migration014_ApplicationService : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ApplicationService_Applications_ApplicationId",
                schema: "public",
                table: "ApplicationService");

            migrationBuilder.DropForeignKey(
                name: "FK_ApplicationService_ServiceCategories_ServiceCategoryId",
                schema: "public",
                table: "ApplicationService");

            migrationBuilder.DropForeignKey(
                name: "FK_ApplicationService_ServiceVariants_ServiceVariantId",
                schema: "public",
                table: "ApplicationService");

            migrationBuilder.DropForeignKey(
                name: "FK_ApplicationService_Services_ServiceId",
                schema: "public",
                table: "ApplicationService");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ApplicationService",
                schema: "public",
                table: "ApplicationService");

            migrationBuilder.RenameTable(
                name: "ApplicationService",
                schema: "public",
                newName: "ApplicationServices",
                newSchema: "public");

            migrationBuilder.RenameIndex(
                name: "IX_ApplicationService_ServiceVariantId",
                schema: "public",
                table: "ApplicationServices",
                newName: "IX_ApplicationServices_ServiceVariantId");

            migrationBuilder.RenameIndex(
                name: "IX_ApplicationService_ServiceId",
                schema: "public",
                table: "ApplicationServices",
                newName: "IX_ApplicationServices_ServiceId");

            migrationBuilder.RenameIndex(
                name: "IX_ApplicationService_ServiceCategoryId",
                schema: "public",
                table: "ApplicationServices",
                newName: "IX_ApplicationServices_ServiceCategoryId");

            migrationBuilder.RenameIndex(
                name: "IX_ApplicationService_ApplicationId",
                schema: "public",
                table: "ApplicationServices",
                newName: "IX_ApplicationServices_ApplicationId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ApplicationServices",
                schema: "public",
                table: "ApplicationServices",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ApplicationServices_Applications_ApplicationId",
                schema: "public",
                table: "ApplicationServices",
                column: "ApplicationId",
                principalSchema: "public",
                principalTable: "Applications",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ApplicationServices_ServiceCategories_ServiceCategoryId",
                schema: "public",
                table: "ApplicationServices",
                column: "ServiceCategoryId",
                principalSchema: "public",
                principalTable: "ServiceCategories",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ApplicationServices_ServiceVariants_ServiceVariantId",
                schema: "public",
                table: "ApplicationServices",
                column: "ServiceVariantId",
                principalSchema: "public",
                principalTable: "ServiceVariants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ApplicationServices_Services_ServiceId",
                schema: "public",
                table: "ApplicationServices",
                column: "ServiceId",
                principalSchema: "public",
                principalTable: "Services",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ApplicationServices_Applications_ApplicationId",
                schema: "public",
                table: "ApplicationServices");

            migrationBuilder.DropForeignKey(
                name: "FK_ApplicationServices_ServiceCategories_ServiceCategoryId",
                schema: "public",
                table: "ApplicationServices");

            migrationBuilder.DropForeignKey(
                name: "FK_ApplicationServices_ServiceVariants_ServiceVariantId",
                schema: "public",
                table: "ApplicationServices");

            migrationBuilder.DropForeignKey(
                name: "FK_ApplicationServices_Services_ServiceId",
                schema: "public",
                table: "ApplicationServices");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ApplicationServices",
                schema: "public",
                table: "ApplicationServices");

            migrationBuilder.RenameTable(
                name: "ApplicationServices",
                schema: "public",
                newName: "ApplicationService",
                newSchema: "public");

            migrationBuilder.RenameIndex(
                name: "IX_ApplicationServices_ServiceVariantId",
                schema: "public",
                table: "ApplicationService",
                newName: "IX_ApplicationService_ServiceVariantId");

            migrationBuilder.RenameIndex(
                name: "IX_ApplicationServices_ServiceId",
                schema: "public",
                table: "ApplicationService",
                newName: "IX_ApplicationService_ServiceId");

            migrationBuilder.RenameIndex(
                name: "IX_ApplicationServices_ServiceCategoryId",
                schema: "public",
                table: "ApplicationService",
                newName: "IX_ApplicationService_ServiceCategoryId");

            migrationBuilder.RenameIndex(
                name: "IX_ApplicationServices_ApplicationId",
                schema: "public",
                table: "ApplicationService",
                newName: "IX_ApplicationService_ApplicationId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ApplicationService",
                schema: "public",
                table: "ApplicationService",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ApplicationService_Applications_ApplicationId",
                schema: "public",
                table: "ApplicationService",
                column: "ApplicationId",
                principalSchema: "public",
                principalTable: "Applications",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ApplicationService_ServiceCategories_ServiceCategoryId",
                schema: "public",
                table: "ApplicationService",
                column: "ServiceCategoryId",
                principalSchema: "public",
                principalTable: "ServiceCategories",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ApplicationService_ServiceVariants_ServiceVariantId",
                schema: "public",
                table: "ApplicationService",
                column: "ServiceVariantId",
                principalSchema: "public",
                principalTable: "ServiceVariants",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ApplicationService_Services_ServiceId",
                schema: "public",
                table: "ApplicationService",
                column: "ServiceId",
                principalSchema: "public",
                principalTable: "Services",
                principalColumn: "Id");
        }
    }
}
