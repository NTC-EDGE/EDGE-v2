using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EDGE.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddKeyAndVariantToForms : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                ALTER TABLE public.""Forms"" ADD COLUMN IF NOT EXISTS ""BaseFormId"" uuid;
                ALTER TABLE public.""Forms"" ADD COLUMN IF NOT EXISTS ""Key"" character varying(100) NOT NULL DEFAULT '';
                ALTER TABLE public.""Forms"" ADD COLUMN IF NOT EXISTS ""ServiceVariantId"" uuid;

                CREATE INDEX IF NOT EXISTS ""IX_Forms_BaseFormId"" ON public.""Forms"" (""BaseFormId"");
                CREATE INDEX IF NOT EXISTS ""IX_Forms_Key"" ON public.""Forms"" (""Key"");
                CREATE INDEX IF NOT EXISTS ""IX_Forms_ServiceVariantId"" ON public.""Forms"" (""ServiceVariantId"");

                DO $$
                BEGIN
                    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_Forms_Forms_BaseFormId') THEN
                        ALTER TABLE public.""Forms"" ADD CONSTRAINT ""FK_Forms_Forms_BaseFormId""
                        FOREIGN KEY (""BaseFormId"") REFERENCES public.""Forms"" (""Id"") ON DELETE SET NULL;
                    END IF;

                    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_Forms_ServiceVariants_ServiceVariantId') THEN
                        ALTER TABLE public.""Forms"" ADD CONSTRAINT ""FK_Forms_ServiceVariants_ServiceVariantId""
                        FOREIGN KEY (""ServiceVariantId"") REFERENCES public.""ServiceVariants"" (""Id"") ON DELETE SET NULL;
                    END IF;
                END $$;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                ALTER TABLE public.""Forms"" DROP CONSTRAINT IF EXISTS ""FK_Forms_Forms_BaseFormId"";
                ALTER TABLE public.""Forms"" DROP CONSTRAINT IF EXISTS ""FK_Forms_ServiceVariants_ServiceVariantId"";
                DROP INDEX IF EXISTS public.""IX_Forms_BaseFormId"";
                DROP INDEX IF EXISTS public.""IX_Forms_Key"";
                DROP INDEX IF EXISTS public.""IX_Forms_ServiceVariantId"";
                ALTER TABLE public.""Forms"" DROP COLUMN IF EXISTS ""BaseFormId"";
                ALTER TABLE public.""Forms"" DROP COLUMN IF EXISTS ""Key"";
                ALTER TABLE public.""Forms"" DROP COLUMN IF EXISTS ""ServiceVariantId"";
            ");
        }
    }
}
