import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';
import { MapViewComponent } from './pages/map-view/map-view';
import { MyOccurrencesComponent } from './pages/my-occurrences/my-occurrences';
import { OccurrenceDetailsComponent } from './pages/occurrence-details/occurrence-details';
import { ProfileComponent } from './pages/profile/profile';
import { ReportFormComponent } from './pages/report-form/report-form';
import { AccountConfirmationComponent } from './pages/account-confirmation/account-confirmation';
import { ForgotPasswordPage } from './pages/forgot-password/forgot-password';
import { ResetPasswordPage } from './pages/reset-password/reset-password';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard';
import { ChangePasswordComponent } from './pages/change-password/change-password';
import { adminGuard } from './guards/admin.guard';
import { ModeratorDashboard } from './pages/moderator-dashboard/moderator-dashboard';


export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'home', component: MapViewComponent },
  { path: 'my-occurrences', component: MyOccurrencesComponent },
  { path: 'occurrence/:id', component: OccurrenceDetailsComponent },
  { path: 'report-form', component: ReportFormComponent },
  { path: 'account-confirmation', component: AccountConfirmationComponent },
  { path: 'forgot-password', component: ForgotPasswordPage },
  { path: 'reset-password', component: ResetPasswordPage },
  { path: 'admin-dashboard', component: AdminDashboardComponent},
  { path: 'profile', component: ProfileComponent },
  { path: 'change-password', component: ChangePasswordComponent },
  { path: 'moderator-dashboard', component: ModeratorDashboard }
];
