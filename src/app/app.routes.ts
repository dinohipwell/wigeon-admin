import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard';
import { HomeComponent } from './components/home/home.component';
import { HelpComponent } from '@components/home/help.component';
import { LoginComponent } from '@components/home/login.component';

export const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      // { path: 'spinner', component: SpinnerComponent, outlet: 'message' },
      { path: 'home', component: HomeComponent },
      { path: 'help', component: HelpComponent },
      { path: 'login', component: LoginComponent },
      { path: 'dashboard', component: DashboardComponent },
    ]
  }
];
