import { Routes } from '@angular/router';
import { HomeComponent } from './pages/public/home/home.component';
import { AboutComponent } from './pages/public/about/about.component';
import { VibeCheckComponent } from './pages/public/vibe-check/vibe-check-parent/vibe-check.component';
import { EventsComponent } from './pages/public/events/events.component';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { VibeCheckFeature } from './pages/public/vibe-check/store/vibe-check.reducer';
import { VibeCheckEffects } from './pages/public/vibe-check/store/vibe-check.effects';
import { ServicesComponent } from './pages/public/services/services.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  { path: 'events', component: EventsComponent },
  {
    path: 'newsletter/confirmed',
    loadComponent: () => import('./pages/public/newsletter-confirmed/newsletter-confirmed.component').then(m => m.NewsletterConfirmedComponent)
  },
  {
    path: 'vibe-check',
    component: VibeCheckComponent,
    providers: [
      provideState(VibeCheckFeature),
      provideEffects(VibeCheckEffects),
    ],
  },
  { path: 'services', component: ServicesComponent },
  { path: '**', component: HomeComponent, pathMatch: 'full' }
]
