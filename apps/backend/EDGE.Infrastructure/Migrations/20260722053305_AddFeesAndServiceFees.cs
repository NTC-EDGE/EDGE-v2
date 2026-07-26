using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EDGE.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddFeesAndServiceFees : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                CREATE TABLE IF NOT EXISTS public.""Fees"" (
                    ""Id"" uuid NOT NULL,
                    ""Code"" character varying(50) NOT NULL,
                    ""Name"" character varying(150) NOT NULL,
                    ""Description"" character varying(500),
                    ""IsActive"" boolean NOT NULL,
                    ""CreatedAt"" timestamp with time zone NOT NULL,
                    ""CreatedBy"" text,
                    ""LastModifiedAt"" timestamp with time zone,
                    ""LastModifiedBy"" text,
                    ""IsDeleted"" boolean NOT NULL DEFAULT false,
                    ""IsDeletedBy"" text NOT NULL DEFAULT '',
                    CONSTRAINT ""PK_Fees"" PRIMARY KEY (""Id"")
                );

                CREATE TABLE IF NOT EXISTS public.""ServiceFees"" (
                    ""Id"" uuid NOT NULL,
                    ""ServiceId"" uuid NOT NULL,
                    ""FeeId"" uuid NOT NULL,
                    ""Amount"" numeric(18,2) NOT NULL,
                    ""IsActive"" boolean NOT NULL,
                    ""CreatedAt"" timestamp with time zone NOT NULL,
                    ""CreatedBy"" text,
                    ""LastModifiedAt"" timestamp with time zone,
                    ""LastModifiedBy"" text,
                    ""IsDeleted"" boolean NOT NULL DEFAULT false,
                    ""IsDeletedBy"" text NOT NULL DEFAULT '',
                    CONSTRAINT ""PK_ServiceFees"" PRIMARY KEY (""Id"")
                );

                ALTER TABLE public.""Fees"" ADD COLUMN IF NOT EXISTS ""IsDeleted"" boolean NOT NULL DEFAULT false;
                ALTER TABLE public.""Fees"" ADD COLUMN IF NOT EXISTS ""IsDeletedBy"" text NOT NULL DEFAULT '';

                ALTER TABLE public.""ServiceFees"" ADD COLUMN IF NOT EXISTS ""IsDeleted"" boolean NOT NULL DEFAULT false;
                ALTER TABLE public.""ServiceFees"" ADD COLUMN IF NOT EXISTS ""IsDeletedBy"" text NOT NULL DEFAULT '';

                ALTER TABLE public.""ServiceFees"" DROP CONSTRAINT IF EXISTS ""FK_ServiceFees_Fees_FeeId"";
                ALTER TABLE public.""ServiceFees"" ADD CONSTRAINT ""FK_ServiceFees_Fees_FeeId"" FOREIGN KEY (""FeeId"") REFERENCES public.""Fees"" (""Id"") ON DELETE RESTRICT;

                CREATE UNIQUE INDEX IF NOT EXISTS ""IX_Fees_Code"" ON public.""Fees"" (""Code"");
                CREATE INDEX IF NOT EXISTS ""IX_ServiceFees_FeeId"" ON public.""ServiceFees"" (""FeeId"");
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ServiceFees",
                schema: "public");

            migrationBuilder.DropTable(
                name: "Fees",
                schema: "public");
        }
    }
}
