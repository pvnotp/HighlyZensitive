export const START_HOUR = 11;
export const END_HOUR = 21;

export enum ServiceType {
  VibeCheck = 'vibe-check',
}

export enum TimePickerStatus {
  Loading = 'Loading',
  Loaded = 'Loaded',
  Error = 'Error',
}

export enum DialogStatus {
  Open = 'Open',
  Closed = 'Closed',
}

export enum BookingStatus {
  Submitting = 'Submitting',
  Submitted = 'Submitted',
  Error = 'Error',
}

export interface Service {
  type: ServiceType;
  duration: number; // minutes
}

export interface ClientDetails {
  name: string;
  email: string;
  phone: string;
}

export interface TimeSlot {
  hour: number;
  minute: number;
  isBooked: boolean;
}

export interface VibeCheckState {
  service: Service | null;
  clientDetails: ClientDetails | null;
  selectedDate: string | null;
  selectedTime: TimeSlot | null;
  times: TimeSlot[];
  timePickerStatus: { status: TimePickerStatus; errorMessage?: string } | null;
  dialogStatus: DialogStatus;
  bookingStatus: { status: BookingStatus; errorMessage?: string } | null;
}

export const initialState: VibeCheckState = {
  service: null,
  clientDetails: null,
  selectedDate: null,
  selectedTime: null,
  times: [],
  timePickerStatus: null,
  dialogStatus: DialogStatus.Closed,
  bookingStatus: null,
};
