import { createActionGroup, emptyProps, props } from '@ngrx/store';

export const GlobalActions = createActionGroup({
  source: 'Global',
  events: {
    'Notify User': props<{ message: string; duration: number; variant: 'success' | 'warn' }>(),
    'Clear Notification': emptyProps(),
  },
});
