import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { ReportFormComponent } from './pages/report-form/report-form';
import { OccurrenceDetailsComponent } from './pages/occurrence-details/occurrence-details';
import { MyOccurrencesComponent } from './pages/my-occurrences/my-occurrences';
import { ProfileComponent } from './pages/profile/profile';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'report-form', component: ReportFormComponent },
    { path: 'occurrence-details', component: OccurrenceDetailsComponent },
    { path: 'my-occurrences', component: MyOccurrencesComponent },
    { path: 'profile', component: ProfileComponent }
];