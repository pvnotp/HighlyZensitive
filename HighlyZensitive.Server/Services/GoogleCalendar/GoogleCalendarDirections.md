# Using the Google Calendar API for a Specific Calendar

This guide explains how to set up and use the Google Calendar API to access a specific calendar from your ASP.NET backend using a service account.

## 1. Google Cloud Setup

1. **Create a Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/).
   - Create a new project or select an existing one.

2. **Enable the Google Calendar API**
   - In the left menu, go to **APIs & Services > Library**.
   - Search for "Google Calendar API" and click **Enable**.

3. **Create a Service Account**
   - Go to **APIs & Services > Credentials**.
   - Click **Create Credentials > Service account**.
   - Give it a name and click through the steps.
   - After creation, go to the service account, open the **Keys** tab, and click **Add Key > Create new key > JSON**.
   - Download and securely store the JSON file (this is your credential).

4. **Share the Calendar with the Service Account**
   - Log in to Google Calendar as the calendar owner.
   - Go to the calendar's settings > **Share with specific people**.
   - Add the service account email (from the JSON file, e.g. `my-service@my-project.iam.gserviceaccount.com`).
   - Set permission to **See all event details**.

5. **Get the Calendar ID**
   - In Google Calendar, go to the calendar's settings > **Integrate calendar**.
   - Copy the **Calendar ID** (may look like `example@gmail.com` or `abcdef123456@group.calendar.google.com`).

## 2. Store Credentials in Your App

- **Local Development:**
  - Add the JSON credential and calendar ID to `appsettings.Development.json`:
    ```json
    "GoogleCalendar": {
      "ServiceAccountJson": "{ ...full JSON... }",
      "CalendarId": "your-calendar-id@group.calendar.google.com"
    }
    ```
- **Production:**
  - Store the JSON in Azure Key Vault or App Service configuration for security.

## 3. Backend Usage (ASP.NET Core)

- Register and inject `IGoogleCalendarService` in `Program.cs`:
  ```csharp
  builder.Services.AddSingleton<IGoogleCalendarService, GoogleCalendarService>();
  ```
- The service reads credentials and calendar ID from configuration.
- Example usage in a controller:
  ```csharp
  [HttpGet("events")]
  public async Task<ActionResult<IList<CalendarEventDto>>> GetEvents([FromQuery] DateTime? from, [FromQuery] DateTime? to)
  {
      var events = await googleCalendarService.GetEventsAsync(from, to);
      return Ok(events);
  }
  ```

## 4. Security Notes

- **Never commit the service account JSON to source control.**
- Rotate the key if it is ever exposed.
- Restrict the service account's permissions to only what is needed.

## 5. References
- [Google Calendar API Docs](https://developers.google.com/calendar/api)
- [Google Cloud Console](https://console.cloud.google.com/)
- [ASP.NET Core Configuration Docs](https://learn.microsoft.com/aspnet/core/fundamentals/configuration/)
