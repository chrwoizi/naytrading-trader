import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainComponent } from './main/MainComponent';
import { AuthGuard } from './auth/AuthGuard';
import { NotAuthGuard } from './auth/NotAuthGuard';
import { LandingComponent } from './landing/LandingComponent';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/landing',
    pathMatch: 'full'
  },
  { path: 'landing', component: LandingComponent },
  { path: 'main', component: MainComponent, canActivate: [AuthGuard] },
  {
    path: 'login',
    loadChildren: () =>
      import('./auth/login/LoginModule').then(m => m.LoginModule),
    canActivate: [NotAuthGuard]
  },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
