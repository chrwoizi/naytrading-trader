import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './LoginComponent';
import { NotAuthGuard } from '../NotAuthGuard';

const routes: Routes = [
  {
    path: '',
    canActivate: [NotAuthGuard],
    component: LoginComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LoginRoutingModule {}
