import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard';
import { HomeComponent } from './components/home/home.component';

export const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      // { path: 'spinner', component: SpinnerComponent, outlet: 'message' },
      { path: 'home', component: HomeComponent },
      // { path: 'help', component: HelpComponent }
    ]
  }
];
