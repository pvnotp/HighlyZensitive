using Microsoft.Extensions.Configuration;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace AlchemyCoaching.Server.Services
{

    public class GmailOAuthService(IConfiguration config, IHttpClientFactory httpClientFactory, ILogger<GmailOAuthService> logger)
    {
        private readonly IConfiguration _config = config;
        private readonly IHttpClientFactory _httpClientFactory = httpClientFactory;
        private readonly ILogger<GmailOAuthService> _logger = logger;

        private string GetRedirectUri()
        {
            var env = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
            if (string.Equals(env, "Production", StringComparison.OrdinalIgnoreCase))
            {
                return "https://alchemycoaching-gacve7fsgmarengw.eastus2-01.azurewebsites.net/auth/oauthtoken";
            }
            return "http://localhost:5287/auth/oauthtoken";
        }

        public async Task<TokenResponse?> ExchangeCodeForTokensAsync(string code)
        {
            var clientId = _config["Gmail:ClientId"];
            var clientSecret = _config["Gmail:ClientSecret"];
            var httpClient = _httpClientFactory.CreateClient();

            var redirectUri = GetRedirectUri();

            var request = new HttpRequestMessage(HttpMethod.Post, "https://oauth2.googleapis.com/token")
            {
                Content = new FormUrlEncodedContent(new[]
                {
                    new KeyValuePair<string, string>("code", code),
                    new KeyValuePair<string, string>("client_id", clientId!),
                    new KeyValuePair<string, string>("client_secret", clientSecret!),
                    new KeyValuePair<string, string>("redirect_uri", redirectUri),
                    new KeyValuePair<string, string>("grant_type", "authorization_code"),
                })
            };

            var response = await httpClient.SendAsync(request);
            var json = await response.Content.ReadAsStringAsync();
            if (!response.IsSuccessStatusCode)
            {
                return null;
            }

            var token = JsonSerializer.Deserialize<TokenResponse>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            return token;
        }
    }

    public class TokenResponse
    {
        [JsonPropertyName("access_token")]
        public string AccessToken { get; set; }
        [JsonPropertyName("refresh_token")]
        public string RefreshToken { get; set; }
        [JsonPropertyName("scope")]
        public string Scope { get; set; }
        [JsonPropertyName("token_type")]
        public string TokenType { get; set; }
        [JsonPropertyName("expires_in")]
        public int ExpiresIn { get; set; }
    }
}
