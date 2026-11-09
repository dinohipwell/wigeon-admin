import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard';

export const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      // { path: 'spinner', component: SpinnerComponent, outlet: 'message' },
      { path: 'home', component: DashboardComponent },
      // { path: 'help', component: HelpComponent }
    ]
  }
];
