using HighlyZensitive.Server.Services;
using Microsoft.AspNetCore.Mvc;

namespace HighlyZensitive.Server.Controllers
{
    [Route("newsletter")]
    [ApiController]
    public class NewsletterController(IConfiguration config,NewsletterService newsletterService) : ControllerBase
    {
        [HttpGet("getSignUp")]
        public async Task<IActionResult> GetSignupEmail([FromQuery] string email)
        {
            var result = await newsletterService.SendSignupEmailAsync(email);
            if (result.Success)
            {
                return Ok();
            }

            return BadRequest(new { message = result.ErrorMessage });
        }

        [HttpGet("confirm")]
        public async Task<IActionResult> Confirm([FromQuery] string email)
        {
            if (string.IsNullOrWhiteSpace(email))
            {
                return BadRequest(new { message = "Email is required." });
            }

            var result = await newsletterService.ConfirmSubscribeAsync(email);
            if (result.Success)
            {
                var clientUrl = config["SiteUrls:Client"];
                return Redirect($"{clientUrl}/newsletter/confirmed");
            }

            return BadRequest(new { message = result.ErrorMessage });
        }
    }
}