using System.ClientModel;
using System.Text;
using DotNetEnv;
using Hangfire;
using Hangfire.PostgreSql;
using KnowledgeOS.Backend.Data;
using KnowledgeOS.Backend.Entities.Users;
using KnowledgeOS.Backend.Jobs;
using KnowledgeOS.Backend.Jobs.Abstractions;
using KnowledgeOS.Backend.Services;
using KnowledgeOS.Backend.Services.Abstractions;
using KnowledgeOS.Backend.Services.Ai;
using KnowledgeOS.Backend.Services.Ai.Abstractions;
using KnowledgeOS.Backend.Services.Content;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using OpenAI;

var builder = WebApplication.CreateBuilder(args);
Env.Load();
builder.Configuration.AddEnvironmentVariables();

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
                       ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");
builder.Services.AddDbContext<AppDbContext>(options => options.UseNpgsql(connectionString));

builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
    {
        options.Password.RequireDigit = false;
        options.Password.RequireLowercase = false;
        options.Password.RequireNonAlphanumeric = false;
        options.Password.RequireUppercase = false;
        options.Password.RequiredLength = 6;
        options.User.RequireUniqueEmail = true;
    })
    .AddEntityFrameworkStores<AppDbContext>()
    .AddDefaultTokenProviders();
var jwtSettings = builder.Configuration.GetSection("Jwt");
var key = Encoding.ASCII.GetBytes(jwtSettings["Key"]!);
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(key)
    };
});


builder.Services.AddHangfire(config =>
    config.SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
        .UseSimpleAssemblyNameTypeSerializer()
        .UseRecommendedSerializerSettings()
        .UsePostgreSqlStorage(options =>
            options.UseNpgsqlConnection(connectionString)));

builder.Services.AddHangfireServer();
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<IIdentityService, IdentityService>();
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();
builder.Services.AddScoped<IResourceService, ResourceService>();
builder.Services.AddScoped<IUrlIngestionJob, UrlIngestionJob>();
builder.Services.AddScoped<IResourceService, ResourceService>();
builder.Services.AddScoped<IUrlIngestionJob, UrlIngestionJob>();

builder.Services.AddScoped<OpenAIClient>(sp =>
{
    var config = sp.GetRequiredService<IConfiguration>();
    var apiKey = config["Ai:OpenRouterKey"]!;
    if (string.IsNullOrEmpty(apiKey))
    {
        throw new InvalidOperationException("OpenRouter API key is not configured.");
    }

    var openRouterOptions = new OpenAIClientOptions
    {
        Endpoint = new Uri("https://openrouter.ai/api/v1")
    };
    return new OpenAIClient(new ApiKeyCredential(apiKey), openRouterOptions);
});
var aiModels = builder.Configuration.GetSection("Ai");
foreach (var model in aiModels.GetChildren())
{
    builder.Services.AddScoped<IAiProvider>(sp =>
    {
        var client = sp.GetRequiredService<OpenAIClient>();
        var logger = sp.GetRequiredService<ILogger<OpenRouterProvider>>();
        return new OpenRouterProvider(client, model.Value!, logger);
    });
}

builder.Services.AddScoped<IAiService, AiService>();
builder.Services.AddScoped<IAiAnalysisJob, AiAnalysisJob>();
builder.Services.AddScoped<IContentFetcher, YouTubeContentFetcher>();
builder.Services.AddScoped<IUserPreferencesService, UserPreferencesService>();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo { Title = "KnowledgeOS API", Version = "v1" });
    options.AddSecurityDefinition(
        "Bearer",
        new OpenApiSecurityScheme
        {
            In = ParameterLocation.Header,
            Description = "Please enter a valid token.",
            Name = "Authorization",
            Type = SecuritySchemeType.Http,
            BearerFormat = "JWT",
            Scheme = "Bearer",
        }
    );

    options.AddSecurityRequirement(document => new() { [new OpenApiSecuritySchemeReference("Bearer", document)] = [] });
});
var app = builder.Build();
if (app.Environment.IsDevelopment())
{
    app.UseSwagger(options => { options.OpenApiVersion = OpenApiSpecVersion.OpenApi3_1; });
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.UseHangfireDashboard();
app.Run();