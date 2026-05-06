using AlchemyCoaching.Server.Services;
using Microsoft.AspNetCore.Mvc;

namespace AlchemyCoaching.Server.Controllers
{
    [Route("calendar")]
    [ApiController]
    public class GoogleCalendarController(IGoogleCalendarService googleCalendarService) : ControllerBase
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
        }
    }
}
