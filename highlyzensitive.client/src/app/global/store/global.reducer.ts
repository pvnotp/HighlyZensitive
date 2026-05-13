import { createFeature, createReducer, on } from '@ngrx/store';
import { GlobalActions } from './global.actions';
import { initialGlobalState } from './global.state';

const reducer = createReducer(
  initialGlobalState,

  on(GlobalActions.notifyUser, (state, { message, duration, variant }) => ({
    ...state,
    notification: {
      displayed: true,
      duration,
      message,
      variant,
    },
  })),
  on(GlobalActions.clearNotification, (state) => ({
    ...state,
    notification: {
      ...state.notification,
      displayed: false,
    },
  })),
);

export const globalFeature = createFeature({
  name: 'global',
  reducer,
});
