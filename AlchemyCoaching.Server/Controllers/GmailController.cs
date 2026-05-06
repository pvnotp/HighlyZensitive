using AlchemyCoaching.Server.Services;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace AlchemyCoaching.Server.Controllers
{
    [Route("gmail")]
    [ApiController]
    public class GmailController(GmailService gmailService) : ControllerBase
    {
        public record SendEmailRequest(string From, string To, string Subject, string Body);

        [HttpPost("sendEmail")]
        public async Task<IActionResult> SendEmail([FromBody] SendEmailRequest request)
        {
            var success = await gmailService.SendEmailAsync(request.From, request.To, request.Subject, request.Body);
            if (success)
                return Ok();
            return BadRequest();
        }
    }
}
