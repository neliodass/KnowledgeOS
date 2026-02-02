using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KnowledgeOS.Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddIsVaultTarget : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsVaultTarget",
                table: "Resources",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsVaultTarget",
                table: "Resources");
        }
    }
}
