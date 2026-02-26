using DotNetEnv;
using Hangfire;
using KnowledgeOS.Backend.Extensions;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
Env.Load();
builder.Configuration.AddEnvironmentVariables();

builder.Services.AddDatabase(builder.Configuration);
builder.Services.AddIdentityConfig(builder.Configuration);
builder.Services.AddHangfireConfig(builder.Configuration);
builder.Services.AddCorsConfig(builder.Configuration);
builder.Services.AddApplicationServices(builder.Configuration);
builder.Services.AddSwaggerConfig();
builder.Services.AddControllers();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<KnowledgeOS.Backend.Data.AppDbContext>();
    await db.Database.MigrateAsync();
}

app.UseSwaggerConfig();
app.UseCorsConfig(app.Environment);
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.UseHangfireDashboard();
app.ScheduleRecurringJobs();

app.Run();

