export type NotificationVariant = 'success' | 'warn';

export interface NotificationState {
  displayed: boolean;
  duration: number;
  message: string;
  variant: NotificationVariant;
}

export interface GlobalState {
  notification: NotificationState;
}

export const initialGlobalState: GlobalState = {
  notification: {
    displayed: false,
    duration: 0,
    message: '',
    variant: 'success' as const,
  },
};
