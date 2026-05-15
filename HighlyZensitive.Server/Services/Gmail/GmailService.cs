using Microsoft.Extensions.Configuration;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;

namespace HighlyZensitive.Server.Services
{
    public class GmailService(
        GmailOAuthService gmailOAuthService,
        IHttpClientFactory httpClientFactory,
        IConfiguration configuration)
    {
        public async Task<bool> SendEmailAsync(string? to, string subject, string body)
        {
            // Get access token from GmailOAuthService
            var accessToken = await gmailOAuthService.GetAccessTokenAsync();
            if (string.IsNullOrEmpty(accessToken))
                return false;

            // Fallback to environment/config recipient when "to" is not provided.
            if (string.IsNullOrEmpty(to))
            {
                to = configuration["Gmail:Account"];
                if (string.IsNullOrEmpty(to))
                    return false;
            }

            // Build raw email message (RFC 2822)
            var rawMessage = $"To: {to}\r\nSubject: {subject}\r\nContent-Type: text/html; charset=utf-8\r\n\r\n{body}";
            var base64Message = System.Convert.ToBase64String(Encoding.UTF8.GetBytes(rawMessage))
                .Replace("+", "-").Replace("/", "_").Replace("=", ""); // URL-safe base64

            var httpClient = httpClientFactory.CreateClient();
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

            var content = new StringContent($"{{\"raw\":\"{base64Message}\"}}", Encoding.UTF8, "application/json");
            var response = await httpClient.PostAsync("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", content);
            return response.IsSuccessStatusCode;
        }
    }
}
