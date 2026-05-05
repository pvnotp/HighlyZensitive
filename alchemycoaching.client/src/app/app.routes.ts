import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { AboutComponent } from './components/about/about.component';
import { SchedulerComponent } from './components/set-appointment/scheduler/scheduler.component';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { setAppointmentFeature } from './components/set-appointment/store/set-appointment.reducer';
import { SetAppointmentEffects } from './components/set-appointment/store/set-appointment.effects';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  {
    path: 'scheduler',
    component: SchedulerComponent,
    providers: [
      provideState(setAppointmentFeature),
      provideEffects(SetAppointmentEffects),
    ],
  },
  { path: '**', component: HomeComponent, pathMatch: 'full' }
]
