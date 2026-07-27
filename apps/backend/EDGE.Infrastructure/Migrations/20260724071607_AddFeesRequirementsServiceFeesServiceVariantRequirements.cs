using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EDGE.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddFeesRequirementsServiceFeesServiceVariantRequirements : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                CREATE TABLE IF NOT EXISTS public.""Requirements"" (
                    ""Id"" uuid NOT NULL,
                    ""Name"" character varying(150) NOT NULL,
                    ""Description"" character varying(500),
                    ""CreatedAt"" timestamp with time zone NOT NULL,
                    ""CreatedBy"" text,
                    ""LastModifiedAt"" timestamp with time zone,
                    ""LastModifiedBy"" text,
                    ""IsDeleted"" boolean NOT NULL DEFAULT false,
                    ""IsDeletedBy"" text NOT NULL DEFAULT '',
                    CONSTRAINT ""PK_Requirements"" PRIMARY KEY (""Id"")
                );

                CREATE TABLE IF NOT EXISTS public.""ServiceVariantRequirements"" (
                    ""Id"" uuid NOT NULL,
                    ""RequirementId"" uuid NOT NULL,
                    ""ServiceVariantId"" uuid NOT NULL,
                    ""ApplicationTypeKey"" character varying(100),
                    ""IsRequired"" boolean NOT NULL,
                    ""CreatedAt"" timestamp with time zone NOT NULL,
                    ""CreatedBy"" text,
                    ""LastModifiedAt"" timestamp with time zone,
                    ""LastModifiedBy"" text,
                    ""IsDeleted"" boolean NOT NULL DEFAULT false,
                    ""IsDeletedBy"" text NOT NULL DEFAULT '',
                    CONSTRAINT ""PK_ServiceVariantRequirements"" PRIMARY KEY (""Id"")
                );

                CREATE INDEX IF NOT EXISTS ""IX_Schedules_ServiceId"" ON public.""Schedules"" (""ServiceId"");
                CREATE INDEX IF NOT EXISTS ""IX_ServiceVariantRequirements_RequirementId"" ON public.""ServiceVariantRequirements"" (""RequirementId"");
                CREATE INDEX IF NOT EXISTS ""IX_ServiceVariantRequirements_ServiceVariantId"" ON public.""ServiceVariantRequirements"" (""ServiceVariantId"");

                DO $$
                BEGIN
                    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_ServiceVariantRequirements_Requirements_RequirementId') THEN
                        ALTER TABLE public.""ServiceVariantRequirements""
                            ADD CONSTRAINT ""FK_ServiceVariantRequirements_Requirements_RequirementId""
                            FOREIGN KEY (""RequirementId"") REFERENCES public.""Requirements"" (""Id"") ON DELETE RESTRICT;
                    END IF;

                    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_ServiceVariantRequirements_ServiceVariants_ServiceVariantId') THEN
                        ALTER TABLE public.""ServiceVariantRequirements""
                            ADD CONSTRAINT ""FK_ServiceVariantRequirements_ServiceVariants_ServiceVariantId""
                            FOREIGN KEY (""ServiceVariantId"") REFERENCES public.""ServiceVariants"" (""Id"") ON DELETE CASCADE;
                    END IF;

                    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_Schedules_Services_ServiceId') THEN
                        ALTER TABLE public.""Schedules""
                            ADD CONSTRAINT ""FK_Schedules_Services_ServiceId""
                            FOREIGN KEY (""ServiceId"") REFERENCES public.""Services"" (""Id"") ON DELETE RESTRICT;
                    END IF;
                END $$;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Schedules_Services_ServiceId",
                schema: "public",
                table: "Schedules");

            migrationBuilder.DropTable(
                name: "ServiceVariantRequirements",
                schema: "public");

            migrationBuilder.DropTable(
                name: "Requirements",
                schema: "public");

            migrationBuilder.DropIndex(
                name: "IX_Schedules_ServiceId",
                schema: "public",
                table: "Schedules");
        }
    }
}
