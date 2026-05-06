
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using AlchemyCoaching.Server.Services;

namespace AlchemyCoaching.Server.Controllers
{
    [Route("auth")]
    [ApiController]
    public class AuthController(IAuthService authService, ILogger<AuthController> logger, GmailOAuthService gmailOAuthService) : ControllerBase
    {
        // GET: api/auth/email@email.com
        [HttpGet("{email}")]
        public async Task<ActionResult<IdentityUser>> GetUser(string email)
        {
            var user = await authService.GetUserByEmailAsync(email);

            if (user == null)
            {
                return NotFound();
            }

            return user;
        }

        // GET: auth/{id}/role
        [HttpGet("{id}/role")]
        public async Task<ActionResult<string>> GetUserRole(string id)
        {
            var userExists = await authService.UserExistsAsync(id);
            if (!userExists)
            {
                return NotFound();
            }

            try
            {
                var roleName = await authService.GetSingleRoleNameAsync(id);
                return Ok(roleName);
            }
            catch (InvalidOperationException)
            {
                logger.LogWarning("Role lookup failed for user {UserId}; expected exactly one role.", id);
                return NotFound();
            }
        }
        // GET: auth/oauthtoken
        [HttpGet("oauthtoken")]
        public async Task<IActionResult> GetOAuthToken([FromQuery] string code)
        {
            var tokens = await gmailOAuthService.ExchangeCodeForTokensAsync(code);
            if (tokens == null)
            {
                return BadRequest("Failed to exchange code for tokens.");
            }
            return Ok(tokens);
        }
    }
}