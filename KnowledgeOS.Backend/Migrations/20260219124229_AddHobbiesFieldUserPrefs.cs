using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KnowledgeOS.Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddHobbiesFieldUserPrefs : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Hobbies",
                table: "UserPreferences",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Hobbies",
                table: "UserPreferences");
        }
    }
}
