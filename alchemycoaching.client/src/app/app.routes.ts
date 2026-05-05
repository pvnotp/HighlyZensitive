import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { AboutComponent } from './components/about/about.component';
import { SchedulerComponent } from './components/set-appointment/scheduler/scheduler.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  { path: 'scheduler', component: SchedulerComponent },
  { path: '**', component: HomeComponent, pathMatch: 'full' }
]
