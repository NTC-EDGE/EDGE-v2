using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EDGE.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddIsIndiviualServiceVariant : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                DO $$ BEGIN
                    IF NOT EXISTS (
                        SELECT 1 FROM information_schema.columns 
                        WHERE table_schema = 'public' 
                          AND table_name = 'ServiceVariants' 
                          AND column_name = 'IsIndividual'
                    ) THEN
                        ALTER TABLE public.""ServiceVariants"" ADD ""IsIndividual"" boolean NOT NULL DEFAULT TRUE;
                    END IF;
                END $$;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsIndividual",
                schema: "public",
                table: "ServiceVariants");
        }
    }
}
