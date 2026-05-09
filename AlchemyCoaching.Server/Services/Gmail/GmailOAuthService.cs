
using System.Text.Json;

namespace AlchemyCoaching.Server.Services
{

    public class GmailOAuthService(IConfiguration config, IHttpClientFactory httpClientFactory)
    {
        private string GetRedirectUri()
        {
            var env = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
            if (string.Equals(env, "Production", StringComparison.OrdinalIgnoreCase))
            {
                return "https://alchemycoaching-gacve7fsgmarengw.eastus2-01.azurewebsites.net/auth/oauthtoken";
            }
            return "http://localhost:5287/auth/oauthtoken";
        }

        public async Task<(TokenResponse? token, string errorJson)> ExchangeCodeForTokensAsync(string code)
        {
            var clientId = config["Gmail:ClientId"];
            var clientSecret = config["Gmail:ClientSecret"];
            var httpClient = httpClientFactory.CreateClient();

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
                return (null, json);
            }

            var token = JsonSerializer.Deserialize<TokenResponse>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            return (token, "");
        }

        public async Task<string?> GetAccessTokenAsync()
        {
            var clientId = config["Gmail:ClientId"];
            var clientSecret = config["Gmail:ClientSecret"];
            var refreshToken = config["Gmail:RefreshToken"];
            if (string.IsNullOrEmpty(clientId) || string.IsNullOrEmpty(clientSecret) || string.IsNullOrEmpty(refreshToken))
                return null;

            var httpClient = httpClientFactory.CreateClient();
            var request = new HttpRequestMessage(HttpMethod.Post, "https://oauth2.googleapis.com/token")
            {
                Content = new FormUrlEncodedContent(new[]
                {
                    new KeyValuePair<string, string>("client_id", clientId),
                    new KeyValuePair<string, string>("client_secret", clientSecret),
                    new KeyValuePair<string, string>("refresh_token", refreshToken),
                    new KeyValuePair<string, string>("grant_type", "refresh_token"),
                })
            };

            var response = await httpClient.SendAsync(request);
            var json = await response.Content.ReadAsStringAsync();
            if (!response.IsSuccessStatusCode)
                return null;

            using var doc = JsonDocument.Parse(json);
            if (doc.RootElement.TryGetProperty("access_token", out var accessTokenElem))
                return accessTokenElem.GetString();
            return null;
        }
    }
}
