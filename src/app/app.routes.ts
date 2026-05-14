import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';
import { MapViewComponent } from './pages/map-view/map-view';
import { MyOccurrencesComponent } from './pages/my-occurrences/my-occurrences';
import { OccurrenceDetailsComponent } from './pages/occurrence-details/occurrence-details';
import { ProfileComponent } from './pages/profile/profile';
import { ReportFormComponent } from './pages/report-form/report-form';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'home', component: MapViewComponent },
  { path: 'my-occurrences', component: MyOccurrencesComponent },
  { path: 'occurrence/:id', component: OccurrenceDetailsComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'report', component: ReportFormComponent }
];