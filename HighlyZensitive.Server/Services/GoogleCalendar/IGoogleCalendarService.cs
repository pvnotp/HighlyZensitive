namespace HighlyZensitive.Server.Services
{
    public interface IGoogleCalendarService
    {
        Task<IList<GoogleCalendarEventDto>> GetEventsAsync(Calendar calendar, DateTime? from, DateTime? to);
        Task<GoogleCalendarEventDto> CreateEventAsync(CreateEventRequest request);
    }

    public enum Calendar
    {
        Appointments,
        Events
    }

    public sealed class GoogleCalendarEventDto
    {
        public string? Id { get; init; }
        public string? Summary { get; init; }
        public DateTimeOffset? Start { get; init; }
        public DateTimeOffset? End { get; init; }
        public string? Description { get; init; }
        public string? Location { get; init; }
        public string? HtmlLink { get; init; }
        public string? Status { get; init; }
        public bool IsAllDay { get; init; }
    }

    public sealed class CreateEventRequest
    {
        public Calendar Calendar { get; init; }
        public required string Summary { get; init; }
        public required DateTimeOffset Start { get; init; }
        public required DateTimeOffset End { get; init; }
        public string? Description { get; init; }
        public string? Location { get; init; }
    }
}
