
using Microsoft.AspNetCore.Identity;
using HighlyZensitive.Server.Services;


var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddHttpClient();
builder.Services.AddScoped<NewsletterService>();
builder.Services.AddSingleton<IGoogleCalendarService, GoogleCalendarService>();
builder.Services.AddSingleton<GmailOAuthService>();
builder.Services.AddSingleton<GmailService>();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddLogging(loggingBuilder =>
{
    loggingBuilder.AddConsole();
    loggingBuilder.AddDebug();
});

var app = builder.Build();

// Validate required configuration at startup
var logger = app.Services.GetRequiredService<ILogger<Program>>();
var config = app.Services.GetRequiredService<IConfiguration>();

var requiredConfig = new[]
{
    ("GoogleCalendar:ServiceAccountJson", false),  // false = don't log value, true = log value
    ("GoogleCalendar:CalendarId", true),
};

foreach (var (key, shouldLogValue) in requiredConfig)
{
    var value = config[key];
    if (string.IsNullOrEmpty(value))
    {
        logger.LogWarning("⚠️ {key} is not configured.", key);
    }
    else
    {
        var displayValue = shouldLogValue ? value : $"({value.Length} chars)";
        logger.LogInformation("✓ {key} is configured: {value}", key, displayValue);
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors(x => x.AllowAnyHeader().AllowAnyMethod().AllowAnyOrigin());

app.UseDefaultFiles();
app.UseStaticFiles();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.MapFallbackToFile("/index.html");

app.Run();
