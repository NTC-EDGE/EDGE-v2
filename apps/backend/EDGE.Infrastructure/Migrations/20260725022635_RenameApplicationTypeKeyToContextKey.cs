using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EDGE.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RenameApplicationTypeKeyToContextKey : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                DO $$
                BEGIN
                    IF EXISTS (
                        SELECT 1 
                        FROM information_schema.columns 
                        WHERE table_schema = 'public' 
                          AND table_name = 'ServiceVariantRequirements' 
                          AND column_name = 'ApplicationTypeKey'
                    ) THEN
                        ALTER TABLE public.""ServiceVariantRequirements"" RENAME COLUMN ""ApplicationTypeKey"" TO ""ContextKey"";
                    END IF;
                END $$;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                DO $$
                BEGIN
                    IF EXISTS (
                        SELECT 1 
                        FROM information_schema.columns 
                        WHERE table_schema = 'public' 
                          AND table_name = 'ServiceVariantRequirements' 
                          AND column_name = 'ContextKey'
                    ) THEN
                        ALTER TABLE public.""ServiceVariantRequirements"" RENAME COLUMN ""ContextKey"" TO ""ApplicationTypeKey"";
                    END IF;
                END $$;
            ");
        }
    }
}
