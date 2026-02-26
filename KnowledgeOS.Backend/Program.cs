using DotNetEnv;
using Hangfire;
using KnowledgeOS.Backend.Extensions;

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

app.UseSwaggerConfig();
app.UseCorsConfig(app.Environment);
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.UseHangfireDashboard();
app.ScheduleRecurringJobs();

app.Run();

