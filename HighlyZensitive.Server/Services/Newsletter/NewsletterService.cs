using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace HighlyZensitive.Server.Services
{
    public class NewsletterService(IConfiguration config, IHttpClientFactory httpClientFactory, GmailService gmailService)
    {
        private const string BrevoContactsUrl = "https://api.brevo.com/v3/contacts";

        public async Task<NewsletterSubscriptionResult> SendSignupEmailAsync(string email)
        {
            var siteUrl = config["SiteUrls:Api"];
            if (string.IsNullOrWhiteSpace(siteUrl))
            {
                return new NewsletterSubscriptionResult(false, "Missing SiteUrl configuration.");
            }   
            var emailBody = NewsletterEmailTemplate.GetEmailBody(email, siteUrl);
            var success = await gmailService.SendEmailAsync(
                from: "alisonjoyforster@gmail.com",
                to: email,
                subject: "The Path to Purpose",
                body: emailBody
            );

            return new NewsletterSubscriptionResult(success, success ? null : "Failed to send confirmation email.");
        }

        public async Task<NewsletterSubscriptionResult> ConfirmSubscribeAsync(string email)
        {
            var request = new NewsletterSubscribeRequest(
                Email: email,
                Attributes: new NewsletterAttributes(FName: "", LName: ""),
                ListIds: new[] { 2 },
                EmailBlacklisted: false,
                SmsBlacklisted: false,
                UpdateEnabled: true
            );

            return await SubscribeAsync(request);
        }
        
        public async Task<NewsletterSubscriptionResult> SubscribeAsync(NewsletterSubscribeRequest request)
        {
            var apiKey = config["Brevo-Key"];
            if (string.IsNullOrWhiteSpace(apiKey))
            {
                return new NewsletterSubscriptionResult(false, "Missing Brevo API key configuration.");
            }

            var client = httpClientFactory.CreateClient();
            client.DefaultRequestHeaders.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            client.DefaultRequestHeaders.TryAddWithoutValidation("api-key", apiKey);

            var payload = JsonSerializer.Serialize(request);
            using var content = new StringContent(payload, Encoding.UTF8, "application/json");
            using var response = await client.PostAsync(BrevoContactsUrl, content);

            if (response.IsSuccessStatusCode)
            {
                return new NewsletterSubscriptionResult(true, null);
            }

            var errorBody = await response.Content.ReadAsStringAsync();
            var errorMessage = string.IsNullOrWhiteSpace(errorBody)
                ? $"Brevo request failed with status code {(int)response.StatusCode}."
                : errorBody;

            return new NewsletterSubscriptionResult(false, errorMessage);
        }
    }

    public record NewsletterSubscriptionResult(bool Success, string? ErrorMessage);

    public record NewsletterSubscribeRequest(
        [property: JsonPropertyName("email")] string Email,
        [property: JsonPropertyName("attributes")] NewsletterAttributes Attributes,
        [property: JsonPropertyName("listIds")] int[] ListIds,
        [property: JsonPropertyName("emailBlacklisted")] bool EmailBlacklisted = false,
        [property: JsonPropertyName("smsBlacklisted")] bool SmsBlacklisted = false,
        [property: JsonPropertyName("updateEnabled")] bool UpdateEnabled = true
    );

    public record NewsletterAttributes(
        [property: JsonPropertyName("FNAME")] string FName,
        [property: JsonPropertyName("LNAME")] string LName
    );
}
