using HighlyZensitive.Server.Services;
using Microsoft.AspNetCore.Mvc;

namespace HighlyZensitive.Server.Controllers
{
    [Route("calendar")]
    [ApiController]
    public class GoogleCalendarController(IGoogleCalendarService googleCalendarService, ILogger<GoogleCalendarController> logger) : ControllerBase
    {
        [HttpGet("events")]
        public async Task<ActionResult<IList<GoogleCalendarEventDto>>> GetEvents(
            [FromQuery] Calendar calendar, [FromQuery] DateTime? from, [FromQuery] DateTime? to)
        {
            try
            {
                var events = await googleCalendarService.GetEventsAsync(calendar, from, to);
                return Ok(events);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Unexpected error fetching calendar events");
                return StatusCode(500, new { error = ex.Message, type = ex.GetType().Name });
            }
        }

        [HttpPost("events")]
        public async Task<ActionResult<GoogleCalendarEventDto>> CreateEvent([FromBody] CreateEventRequest request)
        {
            try
            {
                var created = await googleCalendarService.CreateEventAsync(request);
                return CreatedAtAction(nameof(GetEvents), created);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Unexpected error creating calendar event");
                return StatusCode(500, new { error = ex.Message, type = ex.GetType().Name });
            }
        }
    }
}
