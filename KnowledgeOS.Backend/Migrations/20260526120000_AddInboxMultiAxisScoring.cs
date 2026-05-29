using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Infrastructure;
using KnowledgeOS.Backend.Data;

#nullable disable

namespace KnowledgeOS.Backend.Migrations;

/// <inheritdoc />
[DbContext(typeof(AppDbContext))]
[Migration("20260526120000_AddInboxMultiAxisScoring")]
public partial class AddInboxMultiAxisScoring : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(
            name: "ContentIntent",
            table: "ResourceInboxDetails",
            type: "character varying(30)",
            maxLength: 30,
            nullable: true);

        migrationBuilder.AddColumn<bool>(
            name: "MatchesAvoidance",
            table: "ResourceInboxDetails",
            type: "boolean",
            nullable: false,
            defaultValue: false);

        migrationBuilder.AddColumn<string>(
            name: "Relevance",
            table: "ResourceInboxDetails",
            type: "character varying(30)",
            maxLength: 30,
            nullable: true);

        migrationBuilder.AddColumn<bool>(
            name: "ScoredFromMetadataOnly",
            table: "ResourceInboxDetails",
            type: "boolean",
            nullable: false,
            defaultValue: false);

        migrationBuilder.AddColumn<int>(
            name: "SortPriority",
            table: "ResourceInboxDetails",
            type: "integer",
            nullable: false,
            defaultValue: 0);

        migrationBuilder.AddColumn<string>(
            name: "SubstanceDepth",
            table: "ResourceInboxDetails",
            type: "character varying(30)",
            maxLength: 30,
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "Takeaway",
            table: "ResourceInboxDetails",
            type: "character varying(120)",
            maxLength: 120,
            nullable: true);

        migrationBuilder.AlterColumn<int>(
            name: "AiScore",
            table: "ResourceInboxDetails",
            type: "integer",
            nullable: true,
            oldClrType: typeof(int),
            oldType: "integer");

        migrationBuilder.Sql(
            """
            UPDATE "ResourceInboxDetails"
            SET "SortPriority" = CASE
                WHEN "AiScore" >= 75 THEN 540
                WHEN "AiScore" >= 40 THEN 325
                WHEN "AiScore" > 0 THEN 210
                ELSE 105
            END
            WHERE "SortPriority" = 0 AND "AiScore" IS NOT NULL;
            """);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(name: "ContentIntent", table: "ResourceInboxDetails");
        migrationBuilder.DropColumn(name: "MatchesAvoidance", table: "ResourceInboxDetails");
        migrationBuilder.DropColumn(name: "Relevance", table: "ResourceInboxDetails");
        migrationBuilder.DropColumn(name: "ScoredFromMetadataOnly", table: "ResourceInboxDetails");
        migrationBuilder.DropColumn(name: "SortPriority", table: "ResourceInboxDetails");
        migrationBuilder.DropColumn(name: "SubstanceDepth", table: "ResourceInboxDetails");
        migrationBuilder.DropColumn(name: "Takeaway", table: "ResourceInboxDetails");

        migrationBuilder.AlterColumn<int>(
            name: "AiScore",
            table: "ResourceInboxDetails",
            type: "integer",
            nullable: false,
            defaultValue: 0,
            oldClrType: typeof(int),
            oldType: "integer",
            oldNullable: true);
    }
}
