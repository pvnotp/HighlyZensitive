using HighlyZensitive.Server.Services;
using Microsoft.AspNetCore.Mvc;

namespace HighlyZensitive.Server.Controllers
{
    [Route("gmail")]
    [ApiController]
    public class GmailController(GmailService gmailService, GmailOAuthService gmailOAuthService) : ControllerBase
    {

        [HttpGet("oauthtoken")]
        public async Task<IActionResult> GetOAuthToken([FromQuery] string code)
        {
            var (tokens, errorJson) = await gmailOAuthService.ExchangeCodeForTokensAsync(code);
            if (tokens == null)
            {
                return BadRequest(errorJson);
            }
            return Ok(tokens);
        }

        public record SendEmailRequest(string? To, string Subject, string Body);

        [HttpPost("sendEmail")]
        public async Task<IActionResult> SendEmail([FromBody] SendEmailRequest request)
        {
            var success = await gmailService.SendEmailAsync(request.To, request.Subject, request.Body);
            if (success)
                return Ok();
            return BadRequest();
        }
    }
}
