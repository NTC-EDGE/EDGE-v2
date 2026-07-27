using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EDGE.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixPendingModelChanges : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                ALTER TABLE public.""FieldOffices"" ADD COLUMN IF NOT EXISTS ""TenantId"" uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';
                ALTER TABLE public.""FieldOffices"" ADD COLUMN IF NOT EXISTS ""OfficerInChargeId"" uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';

                DO $$
                BEGIN
                    IF EXISTS (
                        SELECT 1 
                        FROM information_schema.columns 
                        WHERE table_schema = 'public' 
                          AND table_name = 'FieldOffices' 
                          AND column_name = 'OfficerInCharge'
                    ) THEN
                        ALTER TABLE public.""FieldOffices"" DROP COLUMN ""OfficerInCharge"";
                    END IF;

                    IF EXISTS (
                        SELECT 1 
                        FROM information_schema.columns 
                        WHERE table_schema = 'public' 
                          AND table_name = 'FieldOffices' 
                          AND column_name = 'RegionId1'
                    ) THEN
                        ALTER TABLE public.""FieldOffices"" DROP COLUMN ""RegionId1"";
                    END IF;
                END $$;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
        }
    }
}
