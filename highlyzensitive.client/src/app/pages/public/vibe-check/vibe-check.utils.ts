interface TimeSlotLabel {
  label: string;
}

export class VibeCheckUtils {
  static readonly appointmentDateFormatter = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  static formatSelectedDateText(selectedDate: Date | null, selectedSlot: TimeSlotLabel | null): string {
    if (!selectedDate || !selectedSlot) {
      return '';
    }

    return `${VibeCheckUtils.appointmentDateFormatter.format(selectedDate)} at ${selectedSlot.label}`;
  }

  static formatTimeLabel(hour: number, minute: number): string {
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    const amPm = hour < 12 ? 'AM' : 'PM';
    return minute === 0
      ? `${displayHour}:00 ${amPm}`
      : `${displayHour}:${minute.toString().padStart(2, '0')}`;
  }
}