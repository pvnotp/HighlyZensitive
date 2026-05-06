using Google.Apis.Auth.OAuth2;
using Google.Apis.Calendar.v3;
using Google.Apis.Calendar.v3.Data;
using Google.Apis.Services;

namespace AlchemyCoaching.Server.Services
{
    public class GoogleCalendarService(IConfiguration configuration) : IGoogleCalendarService
    {

        private readonly CalendarService _calendarService = new CalendarService(new BaseClientService.Initializer
        {
            HttpClientInitializer = CredentialFactory
                .FromJson<ServiceAccountCredential>(
                    configuration["GoogleCalendar:ServiceAccountJson"]
                        ?? throw new InvalidOperationException("GoogleCalendar:ServiceAccountJson is not configured."))
                .ToGoogleCredential()
                .CreateScoped(CalendarService.Scope.Calendar),
            ApplicationName = "AlchemyCoaching"
        });

        public async Task<IList<GoogleCalendarEventDto>> GetEventsAsync(Calendar calendar, DateTime? from, DateTime? to)
        {


            var fromUtc = (from ?? DateTime.UtcNow).ToUniversalTime();
            var toUtc = (to ?? fromUtc.AddDays(30)).ToUniversalTime();

            if (toUtc <= fromUtc)
            {
                throw new ArgumentException("The 'to' value must be greater than 'from'.");
            }

            var request = _calendarService.Events.List(GetCalendarId(calendar));
            request.TimeMinDateTimeOffset = fromUtc;
            request.TimeMaxDateTimeOffset = toUtc;
            request.SingleEvents = true;
            request.OrderBy = EventsResource.ListRequest.OrderByEnum.StartTime;

            var result = await request.ExecuteAsync();
            var items = result.Items ?? [];

            return items
                .Select(e => new GoogleCalendarEventDto
                {
                    Id = e.Id,
                    Summary = e.Summary,
                    Start = e.Start?.DateTimeDateTimeOffset ?? ToDateTimeOffset(e.Start?.Date),
                    End = e.End?.DateTimeDateTimeOffset ?? ToDateTimeOffset(e.End?.Date),
                    Description = e.Description,
                    Location = e.Location,
                    HtmlLink = e.HtmlLink,
                    Status = e.Status,
                    IsAllDay = !string.IsNullOrWhiteSpace(e.Start?.Date),
                })
                .ToList();
        }

        public async Task<GoogleCalendarEventDto> CreateEventAsync(CreateEventRequest request)
        {
            if (request.End <= request.Start)
            {
                throw new ArgumentException("The 'End' value must be greater than 'Start'.");
            }

            var newEvent = new Event
            {
                Summary = request.Summary,
                Description = request.Description,
                Location = request.Location,
                Start = new EventDateTime { DateTimeDateTimeOffset = request.Start },
                End = new EventDateTime { DateTimeDateTimeOffset = request.End },
            };

            var created = await _calendarService.Events.Insert(newEvent, GetCalendarId(request.Calendar)).ExecuteAsync();

            return new GoogleCalendarEventDto
            {
                Id = created.Id,
                Summary = created.Summary,
                Start = created.Start?.DateTimeDateTimeOffset ?? ToDateTimeOffset(created.Start?.Date),
                End = created.End?.DateTimeDateTimeOffset ?? ToDateTimeOffset(created.End?.Date),
                HtmlLink = created.HtmlLink,
                Status = created.Status,
                IsAllDay = !string.IsNullOrWhiteSpace(created.Start?.Date),
                Description = created.Description,
            };
        }

        private string GetCalendarId(Calendar calendar){
            return calendar switch
            {
                Calendar.Availability => configuration["GoogleCalendar:CalendarId"]
                    ?? throw new InvalidOperationException("GoogleCalendar:CalendarId is not configured."),
                Calendar.Events => configuration["GoogleCalendar:CalendarId"]
                    ?? throw new InvalidOperationException("GoogleCalendar:CalendarId is not configured."),
                _ => throw new ArgumentException("Invalid calendar specified.")
            };
        }

        private static DateTimeOffset? ToDateTimeOffset(string? date)
        {
            if (string.IsNullOrWhiteSpace(date))
            {
                return null;
            }

            return DateTimeOffset.TryParse(date, out var parsed) ? parsed : null;
        }
    }
}
