using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Pgvector;

#nullable disable

namespace KnowledgeOS.Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddProfileEmbeddingVector : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("Npgsql:PostgresExtension:vector", ",,");

            migrationBuilder.AddColumn<Vector>(
                name: "ProfileEmbedding",
                table: "UserPreferences",
                type: "vector(1536)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ProfileEmbeddingUpdatedAt",
                table: "UserPreferences",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ScoringFeedbacks",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<string>(type: "text", nullable: false),
                    ResourceId = table.Column<Guid>(type: "uuid", nullable: false),
                    Comment = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    AiScoreAtFeedback = table.Column<int>(type: "integer", nullable: true),
                    AiVerdictAtFeedback = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ScoringFeedbacks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ScoringFeedbacks_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ScoringFeedbacks_Resources_ResourceId",
                        column: x => x.ResourceId,
                        principalTable: "Resources",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ScoringFeedbacks_ResourceId",
                table: "ScoringFeedbacks",
                column: "ResourceId");

            migrationBuilder.CreateIndex(
                name: "IX_ScoringFeedbacks_UserId_ResourceId_CreatedAt",
                table: "ScoringFeedbacks",
                columns: new[] { "UserId", "ResourceId", "CreatedAt" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ScoringFeedbacks");

            migrationBuilder.DropColumn(
                name: "ProfileEmbedding",
                table: "UserPreferences");

            migrationBuilder.DropColumn(
                name: "ProfileEmbeddingUpdatedAt",
                table: "UserPreferences");

            migrationBuilder.AlterDatabase()
                .OldAnnotation("Npgsql:PostgresExtension:vector", ",,");
        }
    }
}
