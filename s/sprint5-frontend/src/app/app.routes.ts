import { Routes } from '@angular/router';

import { MapViewComponent } from './pages/map-view/map-view';
import { MyOccurrencesComponent } from './pages/my-occurrences/my-occurrences';
import { OccurrenceDetailsComponent } from './pages/occurrence-details/occurrence-details';
import { ReportFormComponent } from './pages/report-form/report-form';

export const routes: Routes = [
  { path: '', redirectTo: 'map-view', pathMatch: 'full' },

  { path: 'map-view', component: MapViewComponent },
  { path: 'my-occurrences', component: MyOccurrencesComponent },
  { path: 'report-form', component: ReportFormComponent },

  { path: 'occurrence/:id', component: OccurrenceDetailsComponent }
];