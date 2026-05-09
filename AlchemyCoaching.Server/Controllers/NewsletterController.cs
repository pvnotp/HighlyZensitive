using AlchemyCoaching.Server.Services;
using Microsoft.AspNetCore.Mvc;

namespace AlchemyCoaching.Server.Controllers
{
    [Route("newsletter")]
    [ApiController]
    public class NewsletterController(NewsletterService newsletterService) : ControllerBase
    {
        [HttpPost("subscribe")]
        public async Task<IActionResult> Subscribe([FromBody] NewsletterSubscribeRequest request)
        {
            var result = await newsletterService.SubscribeAsync(request);
            if (result.Success)
            {
                return Ok();
            }

            return BadRequest(new { message = result.ErrorMessage });
        }
    }
}