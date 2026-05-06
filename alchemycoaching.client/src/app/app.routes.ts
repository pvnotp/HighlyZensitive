import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AboutComponent } from './pages/about/about.component';
import { SchedulerComponent } from './pages/book-appointment/scheduler/scheduler.component';
import { EventsComponent } from './pages/events/events.component';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { BookAppointmentFeature } from './pages/book-appointment/store/book-appointment.reducer';
import { BookAppointmentEffects } from './pages/book-appointment/store/book-appointment.effects';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  { path: 'events', component: EventsComponent },
  {
    path: 'scheduler',
    component: SchedulerComponent,
    providers: [
      provideState(BookAppointmentFeature),
      provideEffects(BookAppointmentEffects),
    ],
  },
  { path: '**', component: HomeComponent, pathMatch: 'full' }
]
