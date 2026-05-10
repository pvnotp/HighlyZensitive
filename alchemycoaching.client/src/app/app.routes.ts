import { Routes } from '@angular/router';
import { HomeComponent } from './pages/public/home/home.component';
import { AboutComponent } from './pages/public/about/about.component';
import { SchedulerComponent } from './pages/public/book-appointment/scheduler/scheduler.component';
import { EventsComponent } from './pages/public/events/events.component';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { BookAppointmentFeature } from './pages/public/book-appointment/store/book-appointment.reducer';
import { BookAppointmentEffects } from './pages/public/book-appointment/store/book-appointment.effects';

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
  {
    path: 'newsletter/confirmed',
    loadComponent: () => import('./pages/public/newsletter-confirmed/newsletter-confirmed.component').then(m => m.NewsletterConfirmedComponent)
  },
  { path: '**', component: HomeComponent, pathMatch: 'full' }
]
