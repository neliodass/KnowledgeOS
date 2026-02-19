using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KnowledgeOS.Backend.Migrations
{
    /// <inheritdoc />
    public partial class SplitResourceMetadata : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Resources_Categories_CategoryId",
                table: "Resources");

            migrationBuilder.DropIndex(
                name: "IX_Resources_CategoryId",
                table: "Resources");

            migrationBuilder.DropColumn(
                name: "AiScore",
                table: "Resources");

            migrationBuilder.DropColumn(
                name: "AiSummary",
                table: "Resources");

            migrationBuilder.DropColumn(
                name: "AiVerdict",
                table: "Resources");

            migrationBuilder.DropColumn(
                name: "CategoryId",
                table: "Resources");

            migrationBuilder.DropColumn(
                name: "PromotedToVaultAt",
                table: "Resources");

            migrationBuilder.DropColumn(
                name: "UserNote",
                table: "Resources");

            migrationBuilder.CreateTable(
                name: "ResourceInboxDetails",
                columns: table => new
                {
                    ResourceId = table.Column<Guid>(type: "uuid", nullable: false),
                    AiScore = table.Column<int>(type: "integer", nullable: false),
                    AiVerdict = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    AiSummary = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ResourceInboxDetails", x => x.ResourceId);
                    table.ForeignKey(
                        name: "FK_ResourceInboxDetails_Resources_ResourceId",
                        column: x => x.ResourceId,
                        principalTable: "Resources",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ResourceVaultDetails",
                columns: table => new
                {
                    ResourceId = table.Column<Guid>(type: "uuid", nullable: false),
                    AiSummary = table.Column<string>(type: "text", nullable: false),
                    SuggestedCategoryName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    CategoryId = table.Column<Guid>(type: "uuid", nullable: true),
                    UserNote = table.Column<string>(type: "text", nullable: true),
                    PromotedToVaultAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ResourceVaultDetails", x => x.ResourceId);
                    table.ForeignKey(
                        name: "FK_ResourceVaultDetails_Categories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "Categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_ResourceVaultDetails_Resources_ResourceId",
                        column: x => x.ResourceId,
                        principalTable: "Resources",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ResourceVaultDetails_CategoryId",
                table: "ResourceVaultDetails",
                column: "CategoryId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ResourceInboxDetails");

            migrationBuilder.DropTable(
                name: "ResourceVaultDetails");

            migrationBuilder.AddColumn<int>(
                name: "AiScore",
                table: "Resources",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AiSummary",
                table: "Resources",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AiVerdict",
                table: "Resources",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CategoryId",
                table: "Resources",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "PromotedToVaultAt",
                table: "Resources",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UserNote",
                table: "Resources",
                type: "text",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Resources_CategoryId",
                table: "Resources",
                column: "CategoryId");

            migrationBuilder.AddForeignKey(
                name: "FK_Resources_Categories_CategoryId",
                table: "Resources",
                column: "CategoryId",
                principalTable: "Categories",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }
    }
}
