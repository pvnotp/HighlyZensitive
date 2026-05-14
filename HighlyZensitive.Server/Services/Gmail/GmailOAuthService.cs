
using System.Text.Json;

namespace HighlyZensitive.Server.Services
{

    public class GmailOAuthService(IConfiguration config, IHttpClientFactory httpClientFactory)
    {
        private string GetRedirectUri()
        {
            var env = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "local";
            return env.ToLower() switch
            {
                "local" => "http://localhost:5000/gmail/oauthtoken",
                "dev" => "https://highlyzensitive-dev.up.railway.app/gmail/oauthtoken",
                "test" => "https://highlyzensitive-test.up.railway.app/gmail/oauthtoken",
                _ => "http://localhost:5000/gmail/oauthtoken"
            };
        }

        public async Task<(TokenResponse? token, string errorJson)> ExchangeCodeForTokensAsync(string code)
        {
            var clientId = config["Gmail:ClientId"];
            var clientSecret = config["Gmail:ClientSecret"];
            var httpClient = httpClientFactory.CreateClient();

            var redirectUri = GetRedirectUri();
            Console.WriteLine($"Redirect URI: {redirectUri}");

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
